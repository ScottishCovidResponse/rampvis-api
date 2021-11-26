import pandas as pd
from sandu.data_types import UncertaintyInput
import json
import ujson
import numpy as np
from tslearn.clustering import TimeSeriesKMeans
from typing import Tuple, List, Callable


def function_on_clusters(raw_cluster_data: str, analysis_function: Callable[[UncertaintyInput], str]):
    """
    Evaluates a function taking an UncertaintyInputObject, on clustered raw data.
    Returns the result for each cluster in a list with the same style as the list of input objects for the cluster.

    Args:
        raw_cluster_data: JSON string which must contain:
            k: number of clusters.
            clusters: a list with the UncertaintyInput object for each cluster in a JSON format.

        analysis_function: Function which is applied to each clusters UncertaintyInput object.

    Returns:
        processed_cluster_data: List with the result of the function evaluation on each cluster, as JSON strings.
    """
    processed_cluster_data = []
    for i in range(raw_cluster_data["k"]):
        object_string = json.dumps(raw_cluster_data["clusters"][i])
        cluster_input_object = json.loads(object_string, object_hook=lambda d: UncertaintyInput(**d))
        processed_cluster_data.append(analysis_function(cluster_input_object))
    return processed_cluster_data


def make_time_series_dataset(df_in: pd.DataFrame, run_name_in: str, time_name_in: str, quantity_name_in: str) -> \
    Tuple[np.ndarray, dict]:
    """
    Returns a numpy array of the form of ts-learn input data,
    and a dictionary relating run_names to the index of that time series in the output.

    Args:
        df_in: input dataframe with all time series. Columns: "run_name","time_name","quantity_name",...
        run_name_in: Name of column containing the model run indices.
        quantity_name_in: Name of column containing the model run indices.
        time_name_in: Name of column containing time values.
    Returns:
        time_series: Numpy array of the time series dataset format ts-learn takes as input.
        run_time_series: Dictionary associating the run_name in the df_in to the index of the time series in time_series
    """
    runs_present = df_in[run_name_in].unique()
    time_samples_present = df_in[time_name_in].unique()

    # making numpy matrix
    nr_of_time_samples = len(time_samples_present)
    nr_of_runs = len(runs_present)

    time_series = np.zeros((nr_of_runs, nr_of_time_samples, 1))
    g = df_in.groupby([run_name_in])
    run_cluster_index = {}  # Associates the run_name with the index in the array clusters, which contains the cluster for each run
    for idx, val in enumerate(runs_present):
        g_df = g.get_group(runs_present[idx]).sort_values(
            time_name_in)  # Get all sampled values with the same index and then sort it according to the time
        g_np = g_df[quantity_name_in].to_numpy()
        time_series[idx, :, 0] = g_np[:]
        run_cluster_index[val] = idx
    return time_series, run_cluster_index


def get_k_mean_clusters(df_in: pd.DataFrame, run_name_in: str, time_name_in: str, quantity_name_in: str, k_in,
                        metric_in='euclidean', seed=42) -> pd.DataFrame:
    """
    Returns a dataframe with an added column containing the cluster each time-series is assigned to

    Args:
        df_in: input dataframe with all time series. Columns: "run_name","time_name","quantity_name",...
        run_name_in: Name of column containing the model run indices.
        quantity_name_in: Name of column containing the quantity of interest.
        time_name_in: Name of column containing time values.
        k_in: Number of clusters.
        metric_in: Metric used for cluster assignment. Options are: “euclidean”, “dtw”, “softdtw”.
        seed: seed used for random number generator. Default: 42.
    Returns:
        df_out: The df_in with an added column containing the cluster index.
    """
    my_time_series, run_time_series = make_time_series_dataset(df_in, run_name_in, time_name_in, quantity_name_in)
    clusters = TimeSeriesKMeans(n_clusters=k_in, verbose=True, random_state=seed, metric=metric_in).fit_predict(
        my_time_series)
    df_out = df_in
    df_out["cluster"] = df_out[run_name_in].map(run_time_series)
    df_out["cluster"] = clusters[df_out["cluster"]]
    return df_out


def form_input_clusters(df_clusters_in, run_name, time_name, quantity_name) -> List[str]:
    """Form a list with containing one input object for each cluster

    Args:
        df_clusters_in: Dataframe containing a column "clusters" with the cluster index for that data
        run_name: Name of column containing the model run indices.
        time_name: Name of column containing time values.
        quantity_name: Name of column containing the quantity of interest.
    Returns:
        clusters: List containing the uncertainty input objects for each cluster as a dictionary
    """
    g = df_clusters_in.groupby(["cluster"])
    unique_clusters = df_clusters_in["cluster"].unique()
    clusters = []
    for i, cluster in enumerate(unique_clusters):
        g_df = g.get_group(cluster)
        new_uncertainty_input = UncertaintyInput(g_df.to_json(index=False, orient="split"), quantity_name, time_name,
                                                 run_name)
        clusters.append(new_uncertainty_input.__dict__)
    return clusters


def save_cluster_data(cluster_data, cluster_data_name, filename, metric, k, model):
    """Saves the data associated with a cluster in a dictionary as a JSON file.

    Args:
        cluster_data: List with k entries, containing the data, can be an object, associated with each cluster.
        cluster_data_name: The key associated with cluster_data
        filename: Name of the created JSON file.
        metric: metric used for clustering, may be euclidean, DTW etc...
        k: number of clusters
        model: Name of the model/input data, to be able to associate clustered data with the model it is from.

    """
    # make a cluster data object
    output = {"metric": metric, "k": k, "model": model, cluster_data_name: cluster_data}
    with open(filename, "w", encoding="utf-8") as f:
        ujson.dump(output, f, ensure_ascii=False, indent=4)
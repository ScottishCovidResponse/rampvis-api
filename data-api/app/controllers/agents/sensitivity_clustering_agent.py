from pathlib import Path
from typing import List
from sandu.data_types import SensitivityInput
import sandu.sensitivity_analysis.cluster_based as cb
import json
import app.controllers.agents.uncertainty_analysis.clustering_tools as ct
import app.controllers.agents.sensitivity_analysis.sensitivity_model_inventory as inventory
from app.core.settings import DATA_PATH_LIVE


def sensitivity_form_clusters(clusters: List[dict]):
    """Find clusters in raw input data, to enable for cluster-wise analysis.

    Args:
        clusters: List containing dictionaries with the parameters and information for computing clusters.
    """
    folder = Path(DATA_PATH_LIVE)
    for values in clusters:
        metric = values["metric"]
        filename = folder / values["filename"]
        output_filename = folder / values["output_filename"]
        k = values["k"]
        model = values["model"]
        
        # Check if file exists
        if not filename.is_file():
            print("CANNOT FIND ", filename)
            return
        
        with open(filename, "r") as read_file:
            x = json.load(read_file, object_hook=lambda d: SensitivityInput(**d))

        df = x.df()
        # Compute Cluster Labels
        clusters = cb.get_kmeans_clusters(df, x.quantity_mean, k, metric, verbose=False)
        df["cluster"] = clusters
        # cluster_raw_data:
        clusters = ct.sens_form_input_clusters(df, x.parameters, x.bounds, x.quantity_mean, x.quantity_variance)
        # Save data
        ct.save_cluster_data(clusters, "clusters", output_filename, metric, k, model)

def get_cluster_list(model_list: List[dict]) -> List[dict]:
    """Form a list of dictionaries containing the information needed to compute clusters, based on the information in model_list.

    Args:
        model_list: List containing a dictionary with: the name, k-values, and distance metrics to be used for cluster analysis of model data.

    Returns:
        cluster_list: A list containing a dictionary with information on each cluster needed to form the clusters.

    """
    models = model_list
    cluster_list = []
    metric_abbreviation = {"euclidean": "e", "dtw": "dtw"}
    for model in models:
        for i in model["k"]:
            for metric in model["metric"]:
                for quantity in model["quantities_of_interest"]:
                    cluster_list.append(
                        {"metric": metric,
                         "filename": "models/sensitivity/" + model["name"] + "/" + quantity["name"] + "_raw.json",
                         "output_filename": "models/sensitivity/" + model["name"] + "/" + quantity["name"] + "_raw_k" + str(i) + "_" + 
                                            metric_abbreviation[metric] + ".json",
                         "k": i,
                         "model": model["name"]}
                    )
    return cluster_list


def sensitivity_clustering_agent():
    model_list = inventory.get_sensitivity_models()
    cluster_list = get_cluster_list(model_list)
    sensitivity_form_clusters(cluster_list)

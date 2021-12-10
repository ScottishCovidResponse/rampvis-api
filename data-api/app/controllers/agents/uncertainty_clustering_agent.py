from pathlib import Path
from typing import List
import threading
import json
from loguru import logger
from apscheduler.schedulers.background import BackgroundScheduler

from sandu.data_types import UncertaintyInput

import app.controllers.agents.uncertainty_analysis.clustering_tools as ct
import app.controllers.agents.uncertainty_analysis.uncertainty_model_inventory as inventory

from app.core.settings import DATA_PATH_LIVE


def uncertainty_form_clusters(clusters: List[dict]):
    """Find clusters in raw input data, to enable for cluster-wise analysis.
    
    Args:
        clusters: List containing dictionaries with the paramters and information for computing clusters.
    """

    for values in clusters:
        folder = Path(DATA_PATH_LIVE)
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
            x = json.load(read_file, object_hook=lambda d: UncertaintyInput(**d))

        df_clusters = ct.get_k_mean_clusters(x.df(), x.run_name, x.time_name, x.quantity_name, k, metric)
        input_clusters = ct.form_input_clusters(df_clusters, x.run_name, x.time_name, x.quantity_name)
        ct.save_cluster_data(input_clusters, "clusters", output_filename, metric, k, model)


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
                cluster_list.append(
                    {"metric": metric,
                     "filename": "models/uncertainty/" + model["name"] + "/raw.json",
                     "output_filename": "models/uncertainty/" + model["name"] + "/raw_k" + str(i) + "_" + metric_abbreviation[metric] + ".json",
                     "k": i,
                     "model": model["name"]}
                )
    return cluster_list


def uncertainty_clustering_agent():
    model_list = inventory.get_uncertainty_models()
    cluster_list = get_cluster_list(model_list)
    uncertainty_form_clusters(cluster_list)

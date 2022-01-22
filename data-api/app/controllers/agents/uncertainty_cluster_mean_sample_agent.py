from pathlib import Path
from typing import List
import threading
import json
from loguru import logger
from apscheduler.schedulers.background import BackgroundScheduler

import app.controllers.agents.uncertainty_analysis.clustering_tools as ct
import app.controllers.agents.uncertainty_analysis.uncertainty_mean_sample as ums
import app.controllers.agents.uncertainty_analysis.uncertainty_model_inventory as inventory

from app.core.settings import DATA_PATH_LIVE


def clusters_mean_sample(raw_clusters: List[dict]):
    """Computes the mean of a group of time series and draws a random sample for plotting.
    """

    for values in raw_clusters:
        folder = Path(DATA_PATH_LIVE)
        filename = folder / values["filename"]
        output_filename = folder / values["output_filename"]

        # Check if file exists
        if not filename.is_file():
            logger.info("CANNOT FIND " + filename)
            return

        with open(filename, "r") as read_file:
            imported = json.load(read_file)

        processed_clusters = ct.unc_function_on_clusters(imported, ums.mean_and_sample)  # Evaluate the function mean_all on all clusters

        ct.save_cluster_data(processed_clusters, "processed", output_filename, imported["metric"], imported["k"],
                             imported["model"])  # Save the processed data


def get_cluster_list(model_list: List[dict]) -> List[dict]:
    """Form a list of dictionaries containing the information needed to compute clusters, based on the information in model_list.

    Args:
        model_list: List containing a dictionary with: the name, k-values, and distance metrics to be used for cluster analysis of model data.
    """
    models = model_list
    cluster_list = []
    metric_abbreviation = {"euclidean": "e", "dtw": "dtw"}
    for model in models:
        for i in model["k"]:
            for metric in model["metric"]:
                cluster_list.append(
                    {"filename": "models/uncertainty/" + model["name"] + "/raw_k" + str(i) + "_" + metric_abbreviation[metric] + ".json",
                     "output_filename": "models/uncertainty/" + model["name"] + "/mean_all_k" + str(i) + "_" + metric_abbreviation[metric] + ".json"}
                )
    return cluster_list


def uncertainty_cluster_mean_sample_agent():
    model_list = inventory.get_uncertainty_models()
    list_of_clusters = get_cluster_list(model_list)
    clusters_mean_sample(list_of_clusters)

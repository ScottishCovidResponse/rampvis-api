from pathlib import Path
from typing import List
import threading
import json
from loguru import logger
from apscheduler.schedulers.background import BackgroundScheduler

import app.controllers.uncertainty_analysis.clustering_tools as ct
import app.controllers.uncertainty_analysis.uncertainty_mean_sample as ums

from app.core.settings import DATA_PATH_LIVE


def clusters_mean_sample(raw_clusters):
    """Computes the mean of a group of time series and draws a random sample for plotting.
    """

    for values in raw_clusters:
        folder = Path(DATA_PATH_LIVE)
        filename = folder / values["filename"]
        output_filename = folder / values["output_filename"]

        # Check if file exists
        if not filename.is_file():
            print("CANNOT FIND ", filename)
            return

        with open(filename, "r") as read_file:
            imported = json.load(read_file)

        processed_clusters = ct.function_on_clusters(imported, ums.mean_and_sample)  # Evaluate the function mean_all on all clusters

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
    filename_model_list = Path(DATA_PATH_LIVE) / "models/uncertainty/uncertainty_inventory.json"

    if not filename_model_list.is_file():
        print("CANNOT FIND ", filename_model_list)
        return
    with open(filename_model_list) as f:
        model_list = json.load(f)
        
    list_of_clusters = get_cluster_list(model_list)
    clusters_mean_sample(list_of_clusters)


# A recurrent job
scheduler = BackgroundScheduler(daemon=True)

# Cron runs at 1am daily
scheduler.add_job(uncertainty_cluster_mean_sample_agent, "cron", hour=1, minute=0, second=0)

scheduler.start()
logger.info('Uncertainty-clustering-agent starts. Will run immediately now and every 1am.')

# Run immediately after server starts
threading.Thread(target=uncertainty_cluster_mean_sample_agent).start()

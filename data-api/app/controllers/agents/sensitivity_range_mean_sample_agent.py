from pathlib import Path
from typing import List
import app.controllers.agents.sensitivity_analysis.sensitivity_mean_sample as sms
import app.controllers.agents.sensitivity_analysis.sensitivity_parameter_tools as spt
import app.controllers.agents.sensitivity_analysis.sensitivity_cluster_max as scm
import json
import app.controllers.agents.uncertainty_analysis.clustering_tools as ct
import app.controllers.agents.sensitivity_analysis.sensitivity_model_inventory as inventory

from app.core.settings import DATA_PATH_LIVE


def clustering_range_mean(raw_clusters: List[dict]):
    folder = Path(DATA_PATH_LIVE)
    for values in raw_clusters:
        filename = folder / values["filename"]
        output_filename = folder / values["output_filename"]

        with open(filename, "r") as read_file:
            imported = json.load(read_file)

        imported_clusters = imported["clusters"]
        mean_all_data = ct.sens_function_on_clusters(imported, sms.mean_and_sample)
        max_y = scm.max_in_clusters(imported)
        parameter_range_data = ct.sens_function_on_clusters(imported, spt.sensitivity_parameter_ranges)
        processed_clusters = {"meanAllData": {"processed": mean_all_data, "yMax": max_y}, "parameterData": parameter_range_data}
        ct.save_cluster_data(processed_clusters, "processed", output_filename, imported["metric"], imported["k"],
                             imported["model"])


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
                        {"filename": "models/sensitivity/" + model["name"] + "/" + quantity["name"] + "_raw_k" + str(i) + "_" +
                                     metric_abbreviation[metric] + ".json",
                         "output_filename": "models/sensitivity/" + model["name"] + "/" + quantity["name"] + "_range_mean_k" + str(i) + "_" +
                                            metric_abbreviation[metric] + ".json"
                         }
                    )
    return cluster_list


def sensitivity_clustering_range_mean_agent():
    model_list = inventory.get_sensitivity_models()
    cluster_list = get_cluster_list(model_list)
    clustering_range_mean(cluster_list)

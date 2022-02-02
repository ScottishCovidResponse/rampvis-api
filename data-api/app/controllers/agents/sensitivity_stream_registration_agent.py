from pathlib import Path
from sandu.data_types import SensitivityInput
from app.core.settings import DATA_PATH_LIVE
import json
import app.controllers.agents.sensitivity_analysis.interaction_tools as it
import app.controllers.agents.sensitivity_analysis.sensitivity_model_inventory as inventory
import numpy as np

"""Agent which generates a json file with the information required for registering all sensitivity analysis data streams."""
def addstream(streams_in, file_path_parent_in, file_path_stem_in, keywords_in, description_in):
    endpoint = str("/data/?product="+file_path_parent_in+"&component="+file_path_stem_in)
    keywords = ["sensitivity"]
    keywords += keywords_in
    entry = {"urlCode": "API_PY",
             "endpoint": endpoint,
             "dataType": "matrix",
             "keywords": keywords,
             "description": description_in
             }
    streams_in.append(entry)
    
def generate_entries(model_list):
    """Copy relevant parts from all the agents you want to add streams for."""
    folder = Path(DATA_PATH_LIVE)
    streams = []
    
    # Sensitivity Summary Curves
    for model in model_list:
        relative_location = "models/sensitivity/" + model["name"]
        location = folder / relative_location
        for quantity in model["quantities_of_interest"]:
            for scalar_feature in model["scalar_features"]:
                output_filename = location / Path(quantity["name"] + "_" + scalar_feature + "_summary_curves.json")

                description = str("Summary curves: " + scalar_feature + " of " + quantity["name"] + " for " + model["name"] + " dataset.")
                addstream(streams, relative_location, Path(output_filename).stem, ["Summary_Curves", "SensitivitySmallMultiple", scalar_feature, quantity["name"], model["name"]], description)
    
    # Sobol Indicies
    for model in model_list:
        relative_location = "models/sensitivity/" + model["name"]
        location = folder / relative_location
        for quantity in model["quantities_of_interest"]:
            for scalar_feature in model["scalar_features"]:

                output_filename = location / Path(quantity["name"] + "_" + scalar_feature + "_sobol.json")
                description = str("Sobol Indices: " + scalar_feature + " of " + quantity["name"] + " for " + model["name"] + " dataset.")
                addstream(streams, relative_location, Path(output_filename).stem, ["Sobol", "SensitivityStackedBarChart", scalar_feature, quantity["name"], model["name"]], description)
    
    
    # Cluster-based analysis
    metric_abbreviation = {"euclidean": "e", "dtw": "dtw"}
    # Output clustering
    for model in model_list:
        for i in model["k"]:
            for metric in model["metric"]:
                for quantity in model["quantities_of_interest"]:
                    output_filename = "models/sensitivity/" + model["name"] + "/" + quantity["name"] + "_range_mean_k" + str(i) + "_" + metric_abbreviation[metric] + ".json"
                    description = str("Cluster-based sensitivity analysis: " + str(i) + " output clusters" + " of " + quantity["name"] + " for " + model["name"] + " dataset.")
                    addstream(streams, "models/sensitivity/" + model["name"], quantity["name"] + "_range_mean_k" + str(i) + "_" + metric_abbreviation[metric], ["Cluster-based Analysis", "SensitivityParameterRangeTickSampleMean", "output", str("k=" + str(i)), quantity["name"], model["name"]], description)
                    


    # input clustering
    for model in model_list:
        for i in model["k"]:
            for metric in model["metric"]:
                for quantity in model["quantities_of_interest"]:
                    with open(str(folder / Path("models/sensitivity/" + model["name"] + "/" + quantity["name"] + "_raw.json")), "r") as read_file:
                        x = json.load(read_file, object_hook=lambda d: SensitivityInput(**d))

                    # Add parameters from interactions
                    _, parameters_padded, bounds_padded = it.custom_inputs(x.df(), x.parameters, x.bounds, model["interactions"])
                    parameters = [parameters_padded[i] for i in range(len(parameters_padded)) if len(bounds_padded[i]) > 1]
                    for parameter in parameters:
                        output_filename = "models/sensitivity/" + model["name"] + "/" + quantity["name"] + "_range_mean_k" + str(i) + "_" + metric_abbreviation[metric] + "_" + parameter + ".json"
                        description = str("Cluster-based sensitivity analysis: " + str(i) + " input clusters" + " of " + parameter + quantity["name"] + " for " + model["name"] + " dataset.")
                        addstream(streams, "models/sensitivity/" + model["name"],
                                  quantity["name"] + "_range_mean_k" + str(i) + "_" + metric_abbreviation[metric] + "_" + parameter,
                                  ["Cluster-based Analysis", "SensitivityParameterRangeTickSampleMean", "input", str("k=" + str(i)), quantity["name"], model["name"]], description)
    
    # All entries added, save json
    registration_list_location = folder/ Path("models/sensitivity/registration_list.json")
    with open(registration_list_location, "w", encoding="utf-8") as f:
        json.dump(streams, f, ensure_ascii=False, indent=4)

def sensitivity_stream_registration_agent():
    model_list = inventory.get_sensitivity_models()
    generate_entries(model_list)

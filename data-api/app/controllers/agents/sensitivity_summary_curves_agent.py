import json
import ujson
from sandu.data_types import SensitivityInput
import app.controllers.agents.sensitivity_analysis.parameter_variation_tools as pvt
import app.controllers.agents.sensitivity_analysis.sensitivity_model_inventory as inventory
from typing import Callable
import random
import numpy as np
from loguru import logger
from app.core.settings import DATA_PATH_LIVE
from pathlib import Path


def calculate_summary_curves(input_filename: str, output_filename: str, scalar_mean_function: Callable[[list], float],
                             scalar_variance_function: Callable[[list], float], interactions_in=[]):
    # Load Sensitivity Input Object
    with open(input_filename, "r") as read_file:
        x = json.load(read_file, object_hook=lambda d: SensitivityInput(**d))

    N_in = 2 ** 4

    # Train model once
    n_steps = 50

    # Compute statistics for a parameter variation plot
    parameters_var, datapoints_x_var, datapoints_y_var, steps_var, y_var, y_mean_var = \
        pvt.parameter_variation(x.df(), x.parameters, x.bounds, x.quantity_mean, x.quantity_variance, N_in, n_steps=n_steps,
                                scalar_mean_function=scalar_mean_function, scalar_variance_function=scalar_variance_function, interactions_in=interactions_in)

    # Saving data to Json
    output = []
    for i, parameter in enumerate(parameters_var):

        dataPoints = []
        for j, dx in enumerate(datapoints_x_var[i]):
            dataPoints.append({"x": datapoints_x_var[i][j], "y": datapoints_y_var[i][j]})

        # all lines
        dataAll = []
        # Only plot a subset of all curves, reduces file size and webpage load times
        y_subset = random.sample(y_var[i], 64)
        for idx, line in enumerate(y_subset):
            for j, y in enumerate(line):
                dataAll.append({"x": steps_var[i][j], "y": line[j], "iter": idx})

        dataMean = []
        for j, y_m in enumerate(y_mean_var[i]):
            dataMean.append({"x": steps_var[i][j], "y": y_mean_var[i][j]})
        output_temp = {"parameter": parameter, "dataPoints": dataPoints, "dataAll": dataAll, "dataMean": dataMean, "runName": "iter",
                       "quantityName": x.quantity_mean, "scalarFeature": str(scalar_mean_function.__name__)}
        output.append(output_temp)

    with open(output_filename, "w", encoding="utf-8") as f:
        ujson.dump(output, f, ensure_ascii=False, indent=4)


def calculate_summary_curves_on_models(model_list):
    folder = Path(DATA_PATH_LIVE)
    for model in model_list:
        relative_location = "models/sensitivity/" + model["name"]
        location = folder / relative_location
        for quantity in model["quantities_of_interest"]:
            input_filename = location / Path(quantity["name"] + "_raw.json")
            for scalar_feature in model["scalar_features"]:
                scalar_function = {"sum": sum, "max": np.max}

                output_filename = location / Path(quantity["name"] + "_" + scalar_feature + "_summary_curves.json")
                calculate_summary_curves(input_filename, output_filename, scalar_mean_function=scalar_function[scalar_feature],
                                         scalar_variance_function=scalar_function[scalar_feature], interactions_in=model["interactions"])


def summary_curves_agent():
    model_list = inventory.get_sensitivity_models()
    calculate_summary_curves_on_models(model_list)
    logger.info("Summary Curves Calculated")

from pathlib import Path

from loguru import logger
import pandas as pd
import numpy as np
import json

from sandu.data_types import SensitivityInput
from sandu.sensitivity_analysis import sobol

from app.core.settings import DATA_PATH_LIVE
import app.controllers.agents.sensitivity_analysis.sensitivity_model_inventory as inventory


def convert_data():
    """Legacy method/agent for computing Sobol indices for plotting from raw data. As this currently produces the example plot it should not be modified.
    !!Look at "calculate_sobol_data_on_models" below for an up do date method!!
    """
    folder = Path(DATA_PATH_LIVE)
    filename = folder / "models/sobol/raw.json"

    # Check if file exists
    if not filename.is_file():
        return

    with open(filename, "r") as read_file:
        x = json.load(read_file, object_hook=lambda d: SensitivityInput(**d))

    N = 2 ** 12  # Note: Must be a power of 2.  (N*(2D+2) parameter value samples are used in the Sobol analysis.

    Si_df = sobol.get_indices(x.df(), x.parameters, x.bounds, x.quantity_mean, x.quantity_variance, N)  # Perform analysis
    Si_df.index.name = "index"
    Si_df.reset_index().to_json(folder / "models/sobol/processed.json", orient="records", index=True)


def calculate_sobol_data_on_models(model_list):
    """Computes sobol indices for plotting from raw data. Computes the indices for all models in teh sensitivity_inventory file and the 
    different scalar features.
    """
    folder = Path(DATA_PATH_LIVE)
    for model in model_list:
        relative_location = "models/sensitivity/" + model["name"]
        location = folder / relative_location
        for quantity in model["quantities_of_interest"]:
            input_filename = location / Path(quantity["name"] + "_raw.json")
            for scalar_feature in model["scalar_features"]:
                scalar_function = {"sum": sum, "max": np.max}

                # Check if file exists
                if not input_filename.is_file():
                    return

                output_filename = location / Path(quantity["name"] + "_" + scalar_feature + "_sobol.json")
                with open(input_filename, "r") as read_file:
                    x = json.load(read_file, object_hook=lambda d: SensitivityInput(**d))

                N = 2 ** 12  # Note: Must be a power of 2.  (N*(2D+2) parameter value samples are used in the Sobol analysis.

                Si_df = sobol.get_indices(x.df(), x.parameters, x.bounds, x.quantity_mean, x.quantity_variance, N,
                                          scalar_mean_function=scalar_function[scalar_feature],
                                          scalar_variance_function=scalar_function[scalar_feature])  # Perform analysis
                Si_df.index.name = "index"
                Si_df.reset_index().to_json(output_filename, orient="records", index=True)


def sobol_index_agent():
    model_list = inventory.get_sensitivity_models()
    calculate_sobol_data_on_models(model_list)
    logger.info("Sobol Indices Calculated")

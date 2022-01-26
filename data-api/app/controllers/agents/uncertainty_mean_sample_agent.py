from pathlib import Path
import threading
import json
import ujson
from loguru import logger
from apscheduler.schedulers.background import BackgroundScheduler

from sandu.data_types import UncertaintyInput

import app.controllers.agents.uncertainty_analysis.uncertainty_mean_sample as ums
import app.controllers.agents.uncertainty_analysis.uncertainty_model_inventory as inventory

from app.core.settings import DATA_PATH_LIVE


def compute_mean_sample(input_filename, output_filename):
    """Computes the mean of a group of time series and draws a random sample from the ensemble.
    """

    # Check if file exists
    if not input_filename.is_file():
        logger.info("CANNOT FIND " + str(input_filename))
        return

    with open(input_filename, "r") as read_file:
        x = json.load(read_file, object_hook=lambda d: UncertaintyInput(**d))
        data_dict = ums.mean_and_sample(x)
    with open(output_filename, "w", encoding="utf-8") as f:
        ujson.dump(data_dict, f, ensure_ascii=False, indent=4)


def uncertainty_mean_sample_agent():
    model_list = inventory.get_uncertainty_models()
    for model in model_list:
        folder = Path(DATA_PATH_LIVE)
        input_filename = folder / str("models/uncertainty/" + model["name"] + "/raw.json")
        output_filename = folder / str("models/uncertainty/" + model["name"] + "/mean_all.json")
        compute_mean_sample(input_filename, output_filename)

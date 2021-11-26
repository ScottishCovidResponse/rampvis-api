from pathlib import Path
import threading
import json
import ujson
from loguru import logger
from apscheduler.schedulers.background import BackgroundScheduler

from sandu.data_types import UncertaintyInput

import app.controllers.uncertainty_analysis.uncertainty_mean_sample as ums

from app.core.settings import DATA_PATH_LIVE


def compute_mean_sample():
    """Computes the mean of a group of time series and draws a random sample for plotting.
    """
    folder = Path(DATA_PATH_LIVE)
    filename = folder / "models/uncertainty/example/raw.json"
    output_filename = folder / "models/uncertainty/example/mean_all.json"

    # Check if file exists
    if not filename.is_file():
        print("CANNOT FIND ", filename)
        return

    with open(filename, "r") as read_file:
        x = json.load(read_file, object_hook=lambda d: UncertaintyInput(**d))
        data_dict = ums.mean_and_sample(x)
    with open(output_filename, "w", encoding="utf-8") as f:
        ujson.dump(data_dict, f, ensure_ascii=False, indent=4)


# A recurrent job
scheduler = BackgroundScheduler(daemon=True)

# Cron runs at 1am daily
scheduler.add_job(compute_mean_sample, "cron", hour=1, minute=0, second=0)

scheduler.start()
logger.info('Uncertainty-mean-sample-analysis agent starts. Will run immediately now and every 1am.')

# Run immediately after server starts
threading.Thread(target=compute_mean_sample).start()

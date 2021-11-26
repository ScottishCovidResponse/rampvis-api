from pathlib import Path
import threading
import json
from loguru import logger
from apscheduler.schedulers.background import BackgroundScheduler

import app.controllers.uncertainty_analysis.clustering_tools as ct
import app.controllers.uncertainty_analysis.uncertainty_mean_sample as ums

from app.core.settings import DATA_PATH_LIVE

raw_clusters = [{"filename": "models/uncertainty/example/raw-k3-E.json",
                 "output_filename": "models/uncertainty/example/mean_all_k3_E.json"},
                {"filename": "models/uncertainty/example/raw-k4-E.json",
                 "output_filename": "models/uncertainty/example/mean_all_k4_E.json"},
                {"filename": "models/uncertainty/example/raw-k5-E.json",
                 "output_filename": "models/uncertainty/example/mean_all_k5_E.json"},
                ]


def clusters_mean_sample():
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


# A recurrent job
scheduler = BackgroundScheduler(daemon=True)

# Cron runs at 1am daily
scheduler.add_job(clusters_mean_sample, "cron", hour=1, minute=0, second=0)

scheduler.start()
logger.info('Uncertainty-clustering-agent starts. Will run immediately now and every 1am.')

# Run immediately after server starts
threading.Thread(target=clusters_mean_sample).start()

from pathlib import Path
import threading
import json
import ujson
import numpy as np
from loguru import logger
from apscheduler.schedulers.background import BackgroundScheduler

from sandu.data_types import UncertaintyInput

import app.controllers.uncertainty_analysis.clustering_tools as ct

from app.core.settings import DATA_PATH_LIVE

clusters = [{"metric": 'euclidean',
             "filename": "models/uncertainty/example/raw.json",
             "output_filename": "models/uncertainty/example/raw-k3-E.json",
             "k": 3,
             "model": "example"},

            {"metric": 'euclidean',
             "filename": "models/uncertainty/example/raw.json",
             "output_filename": "models/uncertainty/example/raw-k4-E.json",
             "k": 4,
             "model": "example"},

            {"metric": 'euclidean',
             "filename": "models/uncertainty/example/raw.json",
             "output_filename": "models/uncertainty/example/raw-k5-E.json",
             "k": 5,
             "model": "example"
             }
            ]


def uncertainty_form_clusters():
    """Clusters raw input data for cluster wise analysis.
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
        print("Clustering Uncertainty Data")
        with open(filename, "r") as read_file:
            x = json.load(read_file, object_hook=lambda d: UncertaintyInput(**d))
        print("Calculating K mean clusters")
        df_clusters = ct.get_k_mean_clusters(x.df(), x.run_name, x.time_name, x.quantity_name, k, metric)
        input_clusters = ct.form_input_clusters(df_clusters, x.run_name, x.time_name, x.quantity_name)
        ct.save_cluster_data(input_clusters, "clusters", output_filename, metric, k, model)


# A recurrent job
scheduler = BackgroundScheduler(daemon=True)

# Cron runs at 1am daily
scheduler.add_job(uncertainty_form_clusters, "cron", hour=1, minute=0, second=0)

scheduler.start()
logger.info('Uncertainty-clustering-agent starts. Will run immediately now and every 1am.')

# Run immediately after server starts
threading.Thread(target=uncertainty_form_clusters).start()

from pathlib import Path

from loguru import logger
import pandas as pd
import json
from apscheduler.schedulers.background import BackgroundScheduler

from sandu.data_types import SensitivityInput
from sandu.sensitivity_analysis import sobol

from app.core.settings import DATA_PATH_LIVE

def convert_data():
    """Computes sobol indicies for plotting from raw data.
    """
    folder = Path(DATA_PATH_LIVE)
    
    with open(folder/"models/sobol/raw.json", "r") as read_file:
        x = json.load(read_file, object_hook=lambda d: SensitivityInput(**d))

    N = 2 ** 12  # Note: Must be a power of 2.  (N*(2D+2) parameter value samples are used in the Sobol analysis.

    Si_df = sobol.get_indices(x.df(), x.parameters, x.bounds, x.quantity_mean, x.quantity_variance, N)  # Perform analysis
    Si_df.index.name = "index"
    Si_df.reset_index().to_json(folder/"models/sobol/processed.json", orient="records", index=True)
        
# A recurrent job
scheduler = BackgroundScheduler(daemon=True)

# Cron runs at 1am daily
scheduler.add_job(convert_data, "cron", hour=1, minute=0, second=0)

scheduler.start()
logger.info('Sensitivity analysis agent starts. Will run immediately now and every 1am.')

# Run immediately after server starts
convert_data()
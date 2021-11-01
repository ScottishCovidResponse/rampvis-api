from pathlib import Path

from loguru import logger
import pandas as pd
from apscheduler.schedulers.background import BackgroundScheduler

from app.core.settings import DATA_PATH_LIVE

def convert_data():
    """Convert raw data to the format required by sensitivity analysis.
    """
    folder = Path(DATA_PATH_LIVE)
    df = pd.read_csv(folder/"models/sobol/raw.csv")
    df.to_csv(folder/"models/sobol/processed.csv", index=False)

# A recurrent job
scheduler = BackgroundScheduler(daemon=True)

# Cron runs at 1am daily
scheduler.add_job(convert_data, "cron", hour=1, minute=0, second=0)

scheduler.start()
logger.info('Sensitivity analysis agent starts. Will run immediately now and every 1am.')

# Run immediately after server starts
convert_data()
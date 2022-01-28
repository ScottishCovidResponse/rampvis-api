from pathlib import Path
from fastapi import APIRouter
import pandas as pd
from app.algorithms.sim_search.precomputation import to_cube
from loguru import logger
from app.core.settings import DATA_PATH_LIVE

def precompute():
    """Run any kind of precomputation that is slow for real-time search.
    """
    try:
        df = pd.read_csv(Path(DATA_PATH_LIVE) / 'owid/full.csv', parse_dates=[3])
        to_cube(df)
        logger.info("to_cube done")

    except:
        logger.error('Cube creation error check owid file')
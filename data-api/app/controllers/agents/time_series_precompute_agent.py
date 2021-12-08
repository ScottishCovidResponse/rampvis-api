from pathlib import Path
from fastapi import APIRouter, Query, Response, Depends
import pandas as pd
from app.algorithms.sim_search.precomputation import to_cube
from loguru import logger
from app.core.settings import DATA_PATH_LIVE

timeseries_sim_search_controller = APIRouter()

@timeseries_sim_search_controller.get("/")
def precompute():
    """Run any kind of precomputation that is slow for real-time search.
    """
    try:
        df = pd.read_csv(Path(DATA_PATH_LIVE) / 'owid/full.csv', parse_dates=[3])
        new_df = to_cube(df)
        new_df.to_csv(Path(DATA_PATH_LIVE) / 'owid/cube.csv')
    except:
        logger.error('Cube creation error check owid file')
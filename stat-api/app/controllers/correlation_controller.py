import os
import json
import pandas as pd
from loguru import logger
from fastapi import APIRouter, Query
from starlette.exceptions import HTTPException
from starlette.status import (
    HTTP_422_UNPROCESSABLE_ENTITY,
    HTTP_500_INTERNAL_SERVER_ERROR,
)

from app.algorithms.franck import compute_metrics
from app.core.settings import DATA_PATH_V04

correlation_controller = APIRouter()


@correlation_controller.get("/")
def query(var1=Query(None), var2=Query(None), metrics=Query(None), window=Query('none')):
    logger.info(f"var1 = {var1}, var2 = {var2}, metrics = {metrics}, window = {window}")

    if var1 is None or var2 is None or metrics is None:
        raise HTTPException(
            status_code=HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Required parameters: var1, var2, metrics",
        )
    try:
        df1 = variable_to_df(var1)
        df2 = variable_to_df(var2)
    except IOError:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Data is not available",
        )

    metrics = metrics.split(",")

    try:
        result = compute_metrics(df1, df2, metrics, window)
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"{e}",
        )

    # Convert to list for serialisation
    for m in metrics:
        result[m] = result[m].tolist()

    return result


def variable_to_df(var):
    filepath = os.path.join(DATA_PATH_V04, var + ".csv")
    logger.info(filepath)
    return pd.read_csv(filepath)

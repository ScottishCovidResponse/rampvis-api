import os
import json
import pandas as pd
from fastapi import APIRouter, Query
from starlette.exceptions import HTTPException
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY

from app.algorithms.algorithm import mse, f_test, pearson_correlation
from app.core.settings import DATA_PATH_V04


scotland_analytics_controller = APIRouter()


@scotland_analytics_controller.get("/nhs-board/")
def query(table=Query(None), metrics=Query(None)):

    if table is None or metrics is None:
        raise HTTPException(
            status_code=HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Required parameters: table, metrics",
        )

    if metrics == "mse":
        return get_metric(mse, table + ".csv")
    elif metrics == "f_test":
        return get_metric(f_test, table + ".csv")
    elif metrics == "pearson_correlation":
        return get_metric(pearson_correlation, table + ".csv")
    else:
        raise HTTPException(
            status_code=HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Not implemented parameters: metrics = {metrics}",
        )


def get_metric(metric_fn, filename):
    """Return a response applying a function on a data file."""
    df = process_csv_data(filename)
    result = metric_fn(df)
    return result


def process_csv_data(filename: str):
    """Return a dataframe from a relative filename."""

    filepath = os.path.join(DATA_PATH_V04, filename)
    df = pd.read_csv(filepath)
    df.replace("*", 0, inplace=True)
    df.drop(columns=["date"], axis=1, inplace=True)
    df = df.astype(int)
    print(df.info())
    return df

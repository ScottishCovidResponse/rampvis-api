import os
import json
from pathlib import Path
import pandas as pd
from fastapi import APIRouter, Query, Response
from starlette.exceptions import HTTPException
from starlette.status import (
    HTTP_422_UNPROCESSABLE_ENTITY,
    HTTP_500_INTERNAL_SERVER_ERROR,
)

from app.algorithms.franck import compute_metrics
from app.utils.naming import component_to_csv_file
from app.core.settings import DATA_PATH_LIVE

data_serve_controller = APIRouter()


@data_serve_controller.get("/")
def query(product=Query(None), component=Query(None), field=Query(None)):
    """
    Return data in JSON format.

    Examples:
    - /stat/v1/data?product=records/SARS-CoV-2/scotland/cases-and-management/hospital&component=nhs_health_board_date_covid19_patients_in_hospital_confirmed
    - /stat/v1/data?product=records/SARS-CoV-2/scotland/cases-and-management/hospital&component=nhs_health_board_date_covid19_patients_in_hospital_confirmed&field=Fife
    """
    folder = Path(DATA_PATH_LIVE)

    if product is None or component is None:
        raise HTTPException(
            status_code=HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Required parameters: product, component",
        )

    # Data structure:
    # - each product is in a folder with subfolders as components
    # - each component is a csv containing all fields
    filename = component_to_csv_file(folder, product, component)
    df = pd.read_csv(filename)
    df.rename(columns={df.columns[0]: "index"}, inplace=True)

    if field is not None:
        df = df[["index", field]]

    result = df.to_json(orient="records")
    return Response(content=result, media_type="application/json")

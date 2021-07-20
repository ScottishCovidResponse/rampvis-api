from pathlib import Path

from loguru import logger
from fastapi import APIRouter, Query, Response
import pandas as pd

from app.core.settings import DATA_PATH_LIVE

timeseries_sim_search_controller = APIRouter()

@timeseries_sim_search_controller.get("/")
async def search(q1=Query(None), q2=Query(None)):
    logger.info(f"timeseries_sim_search_controller q1 = {q1}, q2={q2}")

    # TODO: Just hard code to always return nhs_health_board_date_covid19_patients_in_hospital_confirmed_normalized
    folder = Path(DATA_PATH_LIVE)
    product = 'records/SARS-CoV-2/scotland/cases-and-management/hospital'
    component = 'nhs_health_board_date_covid19_patients_in_hospital_confirmed_normalized'
    filename = folder/product/(component + '.csv')
    df = pd.read_csv(filename)
    result = df.to_json(orient="records")
    return Response(content=result, media_type="application/json")

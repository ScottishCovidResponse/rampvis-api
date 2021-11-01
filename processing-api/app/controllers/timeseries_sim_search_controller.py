from pathlib import Path

from loguru import logger
from fastapi import APIRouter, Query, Response, Depends
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.schedulers.base import STATE_STOPPED, STATE_RUNNING, STATE_PAUSED
import pandas as pd
import json
from app.core.settings import DATA_PATH_LIVE
from app.algorithms.sim_search.precomputation import to_cube
from app.utils.jwt_service import validate_user_token

timeseries_sim_search_controller = APIRouter()

@timeseries_sim_search_controller.get("/")
async def search(start_date=Query(None),country = Query(None),end_date=Query(None),indicator=Query(None),method=Query(None),result_number=Query(None),q2=Query(None)):
    logger.info(f"timeseries_sim_search_controller start_date = {start_date}, country = {country}, end_date={end_date},indicator={indicator},method={method},result_number={result_number},q2={q2}")

    # TODO: Just hard code to always return nhs_health_board_date_covid19_patients_in_hospital_confirmed_normalized
    folder = Path(DATA_PATH_LIVE)
    product = 'records/SARS-CoV-2/scotland/cases-and-management/hospital'
    component = 'nhs_health_board_date_covid19_patients_in_hospital_confirmed_normalized'
    filename = folder/product/(component + '.csv')
    df = pd.read_csv(filename)
    result = df.to_json(orient="records")
    return Response(content=result, media_type="application/json")


def precompute():
    """Run any kind of precomputation that is slow for real-time search.
    """
    df = pd.read_csv(Path(DATA_PATH_LIVE)/'owid/full.csv')
    new_df = to_cube(df)
    new_df.to_csv(Path(DATA_PATH_LIVE)/'owid/cube.csv', index=False)

# Precomputation job
scheduler = BackgroundScheduler(daemon=True)

# Cron runs at 1am daily
scheduler.add_job(precompute, "cron", hour=1, minute=0, second=0)

# Uncomment this to make it run every minute for debugging
# scheduler.add_job(precompute, "cron", second=0)

scheduler.start()
logger.info('Timeseries similarity agent starts. Will run immediately now and every 1am.')

# Run immediately after server starts
precompute()

@timeseries_sim_search_controller.get("/start", dependencies=[Depends(validate_user_token)])
def start():
    # Start if hasn't
    if scheduler.state == STATE_STOPPED:
        scheduler.start()
        return Response(
            json.dumps({"message": "Timeseries sim search: precomputation has started."}),
            media_type="application/json",
        )

    # Resume if paused
    if scheduler.state == STATE_PAUSED:
        scheduler.resume()
        return Response(
            json.dumps({"message": "Timeseries sim search: precomputation has started."}),
            media_type="application/json",
        )

    # Already running
    if scheduler.state == STATE_RUNNING:
        return Response(
            json.dumps({"message": "Timeseries sim search: precomputation is already running."}),
            media_type="application/json",
        )


@timeseries_sim_search_controller.get("/status", dependencies=[Depends(validate_user_token)])
def status():
    if scheduler.state == STATE_STOPPED:
        return Response(
            json.dumps({"message": "Timeseries sim search: precomputation has not started."}),
            media_type="application/json",
        )

    if scheduler.state == STATE_PAUSED:
        return Response(
            json.dumps({"message": "Timeseries sim search: precomputation has paused."}),
            media_type="application/json",
        )

    if scheduler.state == STATE_RUNNING:
        return Response(
            json.dumps({"message": "Timeseries sim search: precomputation is running."}),
            media_type="application/json",
        )


@timeseries_sim_search_controller.get("/stop", dependencies=[Depends(validate_user_token)])
def stop():
    scheduler.pause()
    return Response(
        json.dumps({"message": "Timeseries sim search: precomputation has stopped."}),
        media_type="application/json",
    )

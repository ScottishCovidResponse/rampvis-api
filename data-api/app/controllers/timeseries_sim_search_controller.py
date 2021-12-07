from pathlib import Path
import threading

from loguru import logger
from fastapi import APIRouter, Query, Response, Depends
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.schedulers.base import STATE_STOPPED, STATE_RUNNING, STATE_PAUSED
import pandas as pd
import json
from app.core.settings import DATA_PATH_LIVE
from app.algorithms.sim_search.precomputation import to_cube
from app.algorithms.sim_search.firstrunfunctions import firstRunOutput,continentTransformer
from app.utils.jwt_service import validate_user_token
from pydantic import BaseModel
from typing import List,Dict
from datetime import date

timeseries_sim_search_controller = APIRouter()

class FirstRunForm(BaseModel):
    targetCountry: str 
    firstDate: date
    lastDate: date
    indicator: str
    method: str
    numberOfResults: int
    minPopulation: int
    startDate: date
    endDate: date
    continentCheck: Dict[str,bool]



@timeseries_sim_search_controller.post("/")
async def createform(firstRunForm:FirstRunForm):
    cube = pd.read_csv(Path(DATA_PATH_LIVE)/'owid/cube.csv')
    targetCountry = firstRunForm.targetCountry
    firstDate = firstRunForm.firstDate
    lastDate = firstRunForm.lastDate
    indicator = firstRunForm.indicator
    method = firstRunForm.method
    numberOfResults = firstRunForm.numberOfResults
    minPopulation = firstRunForm.minPopulation
    startDate = firstRunForm.startDate
    endDate = firstRunForm.endDate
    continentCheck = firstRunForm.continentCheck
    continentCheck = continentTransformer(continentCheck)
    out = firstRunOutput(cube,targetCountry,firstDate,lastDate,indicator,method,numberOfResults,minPopulation,startDate,endDate,continentCheck)
    return out


@timeseries_sim_search_controller.get("/")
def precompute():
    """Run any kind of precomputation that is slow for real-time search.
    """
    try:
        df = pd.read_csv(Path(DATA_PATH_LIVE)/'owid/full.csv',parse_dates=[3])
        new_df = to_cube(df)
        new_df.to_csv(Path(DATA_PATH_LIVE)/'owid/cube.csv')
    except:
        logger.error('Cube creation error check owid file')
        

@timeseries_sim_search_controller.get("/start")
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


@timeseries_sim_search_controller.get("/status")
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


@timeseries_sim_search_controller.get("/stop")
def stop():
    scheduler.pause()
    return Response(
        json.dumps({"message": "Timeseries sim search: precomputation has stopped."}),
        media_type="application/json",
    )

from pathlib import Path
import threading

from loguru import logger
from fastapi import APIRouter, Query, Response, Depends
import pandas as pd
import json
from app.core.settings import DATA_PATH_LIVE
from app.algorithms.sim_search.precomputation import to_cube
from app.algorithms.sim_search.firstrunfunctions import firstRunOutput,continentTransformer
from app.utils.jwt_service import validate_user_token
from pydantic import BaseModel
from typing import List,Dict
from datetime import date

from app.controllers.agents.time_series_precompute_agent import precompute

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
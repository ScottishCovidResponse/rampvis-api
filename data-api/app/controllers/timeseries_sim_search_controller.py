from os import lstat
from pathlib import Path

from loguru import logger
from fastapi import APIRouter
from app.core.settings import DATA_PATH_LIVE
from app.algorithms.sim_search.firstrunfunctions import firstRunOutput,continentTransformer
from app.algorithms.sim_search.comparefunction import compareOutput
from app.utils.jwt_service import validate_user_token
from pydantic import BaseModel
from typing import List,Dict
from datetime import date
from app.algorithms.sim_search.predictfunctions import predictOutput

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

class BenchmarkCountries(BaseModel):
    countries: list

class TimeSeries(BaseModel):
    series : list
    query :  dict


@timeseries_sim_search_controller.post("/search/")
async def searchform(firstRunForm:FirstRunForm):
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
    out = firstRunOutput(targetCountry,firstDate,lastDate,indicator,method,numberOfResults,minPopulation,startDate,endDate,continentCheck)
    
    return out

@timeseries_sim_search_controller.post("/compare/")
async def compareform(benchmarkCountries:BenchmarkCountries):
    countries = benchmarkCountries.countries
    out = compareOutput(countries)
    return out

    
@timeseries_sim_search_controller.post("/predict/")
async def predictform(timeSeries:TimeSeries):
    out = predictOutput(timeSeries)
    return out

    
       


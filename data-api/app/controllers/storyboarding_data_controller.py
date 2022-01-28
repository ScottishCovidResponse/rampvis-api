from pathlib import Path
from loguru import logger
from fastapi import APIRouter, Response
import pandas as pd

from app.core.settings import DATA_PATH_LIVE

storyboarding_data_controller = APIRouter()


@storyboarding_data_controller.get("/")
async def get():
    logger.info(f"storyboarding_data_controller:get:")

    filename = Path(DATA_PATH_LIVE) / "phe/ltla/newcasesbypublishdate.csv"
    df = pd.read_csv(filename)
    result = df.to_json(orient="records")
    print("storyboarding_data_controller:get: result = ", result)
    return Response(content=result, media_type="application/json")

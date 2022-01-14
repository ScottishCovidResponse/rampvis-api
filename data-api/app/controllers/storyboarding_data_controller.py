from pathlib import Path
from loguru import logger
from fastapi import APIRouter


storyboarding_data_controller = APIRouter()


@storyboarding_data_controller.get("/")
async def get():
    #
    # TODO:
    # Phong, could you please print the data here?
    # I shall take care of it from there.
    #

    logger.info(f"storyboarding_data_controller:get:")
    return {}

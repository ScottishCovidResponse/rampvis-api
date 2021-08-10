import json
from loguru import logger
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.schedulers.base import STATE_STOPPED, STATE_RUNNING, STATE_PAUSED
from fastapi import APIRouter, Query, Response, Depends
from starlette.exceptions import HTTPException
from starlette.status import (
    HTTP_422_UNPROCESSABLE_ENTITY,
    HTTP_500_INTERNAL_SERVER_ERROR,
)

from app.utils.jwt_service import validate_user_token
from app.services.download_service import download_to_csvs, download_owid
from app.core.settings import DATA_PATH_RAW, DATA_PATH_LIVE, DATA_PATH_STATIC

stream_data_controller = APIRouter()


def download_data():
    """Download daily data.
    """

    try:
        # Currently data products isn't working. Waiting for the data team to fix.
        # with open("manifest/manifest.json") as f:
        #     manifest = json.load(f)
        #     download_to_csvs(manifest, DATA_PATH_RAW, DATA_PATH_LIVE, DATA_PATH_STATIC)

        download_owid(DATA_PATH_LIVE)
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"{e}",
        )


# A recurrent job
scheduler = BackgroundScheduler(daemon=True)
# scheduler.add_job(download_data, "cron", hour=0, minute=0, second=0)
scheduler.add_job(download_data, "cron", second=0)
scheduler.start()


@stream_data_controller.get("/download", dependencies=[Depends(validate_user_token)])
def download():
    download_data()
    return Response("Download completed.")


@stream_data_controller.get("/start", dependencies=[Depends(validate_user_token)])
def start():
    # Start if hasn't
    if scheduler.state == STATE_STOPPED:
        scheduler.start()
        return Response(
            json.dumps({"message": "Data fetching has started."}),
            media_type="application/json",
        )

    # Resume if paused
    if scheduler.state == STATE_PAUSED:
        scheduler.resume()
        return Response(
            json.dumps({"message": "Data fetching has started."}),
            media_type="application/json",
        )

    # Already running
    if scheduler.state == STATE_RUNNING:
        return Response(
            json.dumps({"message": "Data fetching is already running."}),
            media_type="application/json",
        )


@stream_data_controller.get("/status", dependencies=[Depends(validate_user_token)])
def status():
    if scheduler.state == STATE_STOPPED:
        return Response(
            json.dumps({"message": "Data fetching has not started."}),
            media_type="application/json",
        )

    if scheduler.state == STATE_PAUSED:
        return Response(
            json.dumps({"message": "Data fetching has paused."}),
            media_type="application/json",
        )

    if scheduler.state == STATE_RUNNING:
        return Response(
            json.dumps({"message": "Data fetching is running."}),
            media_type="application/json",
        )


@stream_data_controller.get("/stop", dependencies=[Depends(validate_user_token)])
def stop():
    scheduler.pause()
    return Response(
        json.dumps({"message": "Data fetching has stopped."}),
        media_type="application/json",
    )

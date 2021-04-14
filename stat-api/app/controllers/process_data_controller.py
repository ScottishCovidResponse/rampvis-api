#
# TODO: Review this code
#

import os
import json
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.schedulers.base import STATE_STOPPED, STATE_RUNNING, STATE_PAUSED
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR
import pandas as pd
from fastapi import APIRouter, Query, Depends
from starlette.exceptions import HTTPException
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY

from app.utils.jwt_service import validate_user_token
from app.algorithms.franck import compute_metrics


process_data_controller = APIRouter()


METRICS = [
    "ZNCC",
    "pearsonr",
    "spearmanr",
    "kendalltau",
    "SSIM",
    "PSNR",
    "MSE",
    "NRMSE",
    "ME",
    "MAE",
    "MSLE",
    "MedAE",
    "f-test",
]
WINDOW = "none"

#
# TODO this path will be set in app.core.settings
#
CSV_DYNAMIC_DATA = "../../data/v04/csv-data-dynamic/scotland"
METRICS_PATH = "../../data/v04/csv-data-derived-metrics/scotland"

# Will be assigned later for access outside of context
root_path = None


def save_metrics(infolder=CSV_DYNAMIC_DATA, outfolder=METRICS_PATH):
    """
    Compute metrics for each pair of files in given folder and save the results.
    """
    global root_path

    infolder = os.path.join(root_path, infolder)
    for filename1 in os.listdir(infolder):
        for filename2 in os.listdir(infolder):
            filename = (
                "scotland."
                + filename1.replace(".csv", "")
                + "___scotland."
                + filename2.replace(".csv", "")
            )
            compute_one_pair(
                os.path.join(infolder, filename1),
                os.path.join(infolder, filename2),
                os.path.join(root_path, outfolder, filename),
            )


def compute_one_pair(filename1, filename2, outfile):
    "Compute metrics between the two given files and save the metrics to a new file."
    df1 = pd.read_csv(filename1)
    df2 = pd.read_csv(filename2)

    try:
        result = compute_metrics(df1, df2, METRICS, WINDOW)
        # Convert to list for serialisation
        for m in METRICS:
            result[m] = result[m].tolist()

        # Added the last date of the data for reference
        result["last_date"] = df1.iloc[-1]["date"]
    except Exception as e:
        result = str(e)

    # Save to file
    with open(outfile, "w") as f:
        json.dump(result, f)


#
# initialise scheduler
#
def scheduler_exception_listener(event):
    if event.exception:
        print("scheduler_exception_listener: the job crashed")
    else:
        print("scheduler_exception_listener: the job executed")


scheduler = BackgroundScheduler(daemon=True)
scheduler.add_listener(
    scheduler_exception_listener, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR
)
scheduler.add_job(save_metrics, "interval", seconds=3)


@process_data_controller.get("/start", dependencies=[Depends(validate_user_token)])
def start():
    if scheduler.state == STATE_RUNNING:
        return f"Simulation has already started."

    # TODO not using flask current_app anymore, this code has to be updated
    global root_path
    root_path = current_app.root_path

    if not os.path.exists(os.path.join(root_path, METRICS_PATH)):
        os.makedirs(os.path.join(root_path, METRICS_PATH))

    scheduler.start()
    return f"Simulation of computing derived data has started."


@process_data_controller.get("/status", dependencies=[Depends(validate_user_token)])
def status():
    if scheduler.state == STATE_STOPPED:
        return "Simulation has not started."

    if scheduler.state == STATE_PAUSED:
        return f"Simulation has paused."

    if scheduler.state == STATE_RUNNING:
        return f"Simulation is running."


@process_data_controller.get("/stop", dependencies=[Depends(validate_user_token)])
def stop():
    scheduler.pause()
    return "Simulation of computing derived data has stopped."


@process_data_controller.get("/resume", dependencies=[Depends(validate_user_token)])
def resume():
    scheduler.resume()
    return f"Simulation has resumed."

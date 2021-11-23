import os
import json
from pathlib import Path

from loguru import logger
from fastapi import APIRouter, Query, Response
import pandas as pd
from app.core.settings import DATA_PATH_LIVE

DATA_DIR = Path(DATA_PATH_LIVE)/"ensemble"

ensemble_controller = APIRouter()

@ensemble_controller.get("/meta")
async def meta(name=Query("default")):
    """Return all available meta files.
    `name` is a subfolder of ensemble.
    """
    filenames = ["posterior_parameters_meta", "posterior_parameters_original", "posterior_parameters"]
    filenames = [DATA_DIR/name/(filename + ".csv") for filename in filenames]
    filenames = [filename for filename in filenames if filename.is_file()]
    results = { filename.stem:pd.read_csv(filename).to_dict(orient="records") 
                for filename in filenames }
    return Response(content=json.dumps(results), media_type="application/json")

@ensemble_controller.get("/data")
async def data(path=Query(""), name=Query("default")):
    """Return data.
    `name` is a subfolder of ensemble.
    `path` is the folder such as data/output/simu_0.
    """
    data_dir = DATA_DIR/name/path
    if not data_dir.exists():
        return Response(content=json.dumps({"message": f"path {path} does not exist"}), media_type="application/json")

    results = folder_to_dict_recursive(data_dir)
    return Response(content=json.dumps(results), media_type="application/json")

def folder_to_dict_recursive(data_dir):
    """Return a dict of the given folder. Leaf nodes are csv files.
    """
    if data_dir.is_file():
        df = pd.read_csv(data_dir)
        df = df.fillna('NULL')
        return df.to_dict(orient="records") 

    results = {}
    for name in os.listdir(data_dir):
        if name.startswith("."):
            continue

        # Leaf node: list of records
        if name.endswith(".csv"):
            df = pd.read_csv(data_dir/name)
            df = df.fillna('NULL')
            results[name[:-4]] = df.to_dict(orient="records") 

        # Directory: continue cursively
        if (data_dir/name).is_dir():
            results[name] = folder_to_dict_recursive(data_dir/name)
    return results
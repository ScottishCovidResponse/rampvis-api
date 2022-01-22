from pathlib import Path
import json
from app.core.settings import DATA_PATH_LIVE
from typing import List
from loguru import logger

def get_uncertainty_models() -> List[dict]:
    """Parses the inventory file, containing information on what models and clusterings are present. 
    
    Returns:
        model_list: List where each entry is a dictionary with information regarding a model. The dictionary contains keys:
            k: List of the clusters which should be computed.
            name: name of the model, must match the name of the folder where the raw.json for the model is stored.
            metric: List containing the metrics to be used to find clusters. Allowed options are: euclidean, dtw.
    """
    filename_model_list = Path(DATA_PATH_LIVE) / "models/uncertainty/uncertainty_inventory.json"

    if not filename_model_list.is_file():
        logger.info("CANNOT FIND " + filename_model_list)
        return
    with open(filename_model_list) as f:
        model_list = json.load(f)
    return model_list

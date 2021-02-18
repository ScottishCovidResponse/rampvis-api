import logging

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

import json

from flask import Response, current_app, Blueprint
from ..utils import validate_token
from ..services import download_to_csvs

static_data_bp = Blueprint(
    'static_data_bp',
    __name__,
    url_prefix='/stat/v1/static_data/',
)

config = current_app.config


def download_data():
    """
    Download data products from https://data.scrc.uk/.
    """
    try:
        with open('static_manifest.json') as f:
            manifest = json.load(f)
            download_to_csvs(manifest, config.get('DATA_PATH_RAW'), config.get('DATA_PATH_STATIC')) 
    except Exception as e:
        logger.error(e, exc_info=True)

# Testing only: download immediately
download_data()

@static_data_bp.route('/', methods=['GET'])
@validate_token
def start():
    download_data()
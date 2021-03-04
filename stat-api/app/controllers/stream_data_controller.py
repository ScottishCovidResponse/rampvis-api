import logging

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

import json

from flask import Response, current_app, Blueprint
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.schedulers.base import STATE_STOPPED, STATE_RUNNING, STATE_PAUSED
from ..utils import validate_token
from ..services import download_to_csvs

stream_data_bp = Blueprint(
    'stream_data_bp',
    __name__,
    url_prefix='/stat/v1/stream_data/',
)


def download_data():
    """
    Download data products from https://data.scrc.uk/.
    """
    config = current_app.config

    try:
        with open('manifest/manifest.json') as f:
            manifest = json.load(f)
            download_to_csvs(manifest, config.get('DATA_PATH_RAW'), config.get('DATA_PATH_LIVE'), config.get('DATA_PATH_STATIC')) 
    except Exception as e:
        logger.error(e, exc_info=True)

# A recurrent job
scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(download_data, 'cron', hour=0, minute=0, second=0)
scheduler.start()

# Testing only: download immediately
# download_data()

@stream_data_bp.route('/start', methods=['GET'])
@validate_token
def start():
    # Start if hasn't
    if scheduler.state == STATE_STOPPED:
        scheduler.start()
        return Response(json.dumps({'message': 'Data fetching has started.'}), mimetype='application/json')

    # Resume if paused
    if scheduler.state == STATE_PAUSED:
        scheduler.resume()
        return Response(json.dumps({'message': 'Data fetching has started.'}), mimetype='application/json')

    # Already running
    if scheduler.state == STATE_RUNNING:
        return Response(json.dumps({'message': 'Data fetching is already running.'}), mimetype='application/json')


@stream_data_bp.route('/status', methods=['GET'])
@validate_token
def status():
    if scheduler.state == STATE_STOPPED:
        return Response(json.dumps({'message': 'Data fetching has not started.'}), mimetype='application/json')

    if scheduler.state == STATE_PAUSED:
        return Response(json.dumps({'message': 'Data fetching has paused.'}), mimetype='application/json')

    if scheduler.state == STATE_RUNNING:
        return Response(json.dumps({'message': 'Data fetching is running.'}), mimetype='application/json')


@stream_data_bp.route('/stop', methods=['GET'])
@validate_token
def stop():
    scheduler.pause()
    return Response(json.dumps({'message': 'Data fetching has stopped.'}), mimetype='application/json')

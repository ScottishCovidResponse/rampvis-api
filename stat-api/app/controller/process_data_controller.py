import os
import json
from flask import Response, current_app, Blueprint
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.schedulers.base import STATE_STOPPED, STATE_RUNNING, STATE_PAUSED
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR
import pandas as pd

from app.services.algorithms.franck import compute_metrics
from app.utils.jwt_service import validate_token

process_data_bp = Blueprint(
    'process_data_bp',
    __name__,
    url_prefix='/stat/v1/process_data/',
)


METRICS = ['ZNCC', 'pearsonr', 'spearmanr', 'kendalltau', 'SSIM', 'PSNR', 'MSE', 'NRMSE', 'ME', 'MAE', 'MSLE', 'MedAE',
           'f-test']
WINDOW = 'none'

CSV_DYNAMIC_DATA = '../../data/v04/csv-data-dynamic/scotland'
METRICS_PATH = '../../data/v04/csv-data-derived-metrics/scotland'

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
            filename = 'scotland.' + filename1.replace('.csv', '') + '___scotland.' + filename2.replace('.csv', '')
            compute_one_pair(
                os.path.join(infolder, filename1),
                os.path.join(infolder, filename2),
                os.path.join(root_path, outfolder, filename))


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
        result['last_date'] = df1.iloc[-1]['date']
    except Exception as e:
        result = str(e)

    # Save to file
    with open(outfile, 'w') as f:
        json.dump(result, f)


#
# initialise scheduler
#
def scheduler_exception_listener(event):
    if event.exception:
        print('scheduler_exception_listener: the job crashed')
    else:
        print('scheduler_exception_listener: the job executed')


scheduler = BackgroundScheduler(daemon=True)
scheduler.add_listener(scheduler_exception_listener, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)
scheduler.add_job(save_metrics, 'interval', seconds=3)


@process_data_bp.route('/start', methods=['GET'])
@validate_token
def start():
    if scheduler.state == STATE_RUNNING:
        return Response(json.dumps({'message': f'Simulation has already started.'}), mimetype='application/json')

    global root_path
    root_path = current_app.root_path

    if not os.path.exists(os.path.join(root_path, METRICS_PATH)):
        os.makedirs(os.path.join(root_path, METRICS_PATH))

    scheduler.start()
    return Response(f'Simulation of computing derived data has started.', mimetype='application/json')


@process_data_bp.route('/status', methods=['GET'])
@validate_token
def status():
    if scheduler.state == STATE_STOPPED:
        return Response('Simulation has not started.', mimetype='application/json')

    if scheduler.state == STATE_PAUSED:
        return Response(f'Simulation has paused.', mimetype='application/json')

    if scheduler.state == STATE_RUNNING:
        return Response('Simulation is running.', mimetype='application/json')


@process_data_bp.route('/stop', methods=['GET'])
@validate_token
def stop():
    scheduler.pause()
    return Response('Simulation of computing derived data has stopped.', mimetype='application/json')


@process_data_bp.route('/resume', methods=['GET'])
@validate_token
def resume():
    scheduler.resume()
    return Response(f'Simulation has resumed.', mimetype='application/json')

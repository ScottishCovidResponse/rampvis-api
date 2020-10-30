import os
from datetime import datetime, timedelta
import json
from flask import Response, current_app, Blueprint
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.schedulers.base import STATE_STOPPED, STATE_RUNNING, STATE_PAUSED

from app.utils.jwt_service import validate_token

stream_data_bp = Blueprint(
    'stream_data_bp',
    __name__,
    url_prefix='/stat/v1/stream_data/',
)


# TODO: set from Config
CSV_DATA = '../../data/v04/csv-data/scotland'
CSV_DYNAMIC_DATA = '../../data/v04/csv-data-dynamic/scotland'
CSV_FILES = ['cumulative_cases.csv', 'hospital_confirmed.csv', 'hospital_suspected.csv', 'icu_patients.csv']
FIRST_DATE = datetime(2020, 4, 1)
LAST_DATE = datetime(2020, 7, 21)

current_date = None

# Will be assigned later for access outside of context
root_path = None


def generate_data(infolder=CSV_DATA, outfolder=CSV_DYNAMIC_DATA):
    """
    Generate dynamic data.

    Extract rows that are up to `current_date` from each csv file in `infolder` and save into `outfolder`.
    Increase the `current_date` by 1.
    """
    global current_date, root_path

    # Cycle FIRST_DATE -> LAST_DATE
    if current_date > LAST_DATE:
        current_date = FIRST_DATE

    infolder = os.path.join(root_path, infolder)
    outfolder = os.path.join(root_path, outfolder)

    #for filename in os.listdir(infolder):
    for filename in CSV_FILES:
        extract_rows(os.path.join(infolder, filename), os.path.join(outfolder, filename), current_date)

    # Prepare for next simulation 
    current_date += timedelta(days=1)


def extract_rows(infile, outfile, current_date):
    "Extract rows and save file."
    with open(infile) as f:
        inlines = f.readlines()

    header = inlines[0].strip()
    outlines = [header]

    for line in inlines[1:]:
        # print('infile = ', infile, line.split(',')[0])
        date = datetime.strptime(line.split(',')[0], '%d/%m/%Y')

        # Up to the current date
        if date > current_date:
            break

        outlines.append(line.strip())

    with open(outfile, 'w') as f:
        f.write('\n'.join(outlines))


# A recurrent job
scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(generate_data, 'interval', seconds=3)


@stream_data_bp.route('/start', methods=['GET'])
@validate_token
def start():
    global current_date, root_path
    root_path = current_app.root_path

    if not os.path.exists(os.path.join(root_path, CSV_DYNAMIC_DATA)):
        os.makedirs(os.path.join(root_path, CSV_DYNAMIC_DATA))

    # Start if hasn't
    if scheduler.state == STATE_STOPPED:
        current_date = FIRST_DATE
        scheduler.start()
        return Response(json.dumps({'message': f'Simulation of data stream has started. Starting from {current_date:%d/%m/%Y}, daily data will come every 3 seconds.'}), mimetype='application/json')

    # Resume if paused
    if scheduler.state == STATE_PAUSED:
        current_date = FIRST_DATE
        scheduler.resume()
        return Response(json.dumps({'message': f'Simulation of data stream has started. Starting from {current_date:%d/%m/%Y}, daily data will come every 3 seconds.'}), mimetype='application/json')


@stream_data_bp.route('/status', methods=['GET'])
@validate_token
def status():
    if scheduler.state == STATE_STOPPED:
        return Response(json.dumps({'message': f'Simulation has not started.'}), mimetype='application/json')

    if scheduler.state == STATE_PAUSED:
        return Response(json.dumps({'message': f'Simulation has paused. Current date is: {current_date:%d/%m/%Y}.'}),
                        mimetype='application/json')

    if scheduler.state == STATE_RUNNING:
        return Response(json.dumps({'message': f'Simulation is running. Current date is: {current_date:%d/%m/%Y}.'}),
                        mimetype='application/json')


@stream_data_bp.route('/stop', methods=['GET'])
@validate_token
def stop():
    scheduler.pause()
    return Response(json.dumps({'message': 'Simulation of data stream has stopped.'}), mimetype='application/json')


@stream_data_bp.route('/resume', methods=['GET'])
@validate_token
def resume():
    scheduler.resume()
    return Response(json.dumps({'message': f'Simulation has resumed. Current date is {current_date:%d/%m/%Y}.'}), mimetype='application/json')

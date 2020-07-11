import os
from datetime import datetime, timedelta

from flask import Response, current_app
from app.stream_data import blueprint
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.schedulers.base import STATE_STOPPED, STATE_RUNNING, STATE_PAUSED

LAST_DATE = datetime(2020, 5, 26)

current_date = None

# Will be assigned later for access outside of context
root_path = None

def generate_data(infolder='../../csv-data/scotland', outfolder='../../csv-data-dynamic/scotland'):
    """
    Generate dynamic data.

    Extract rows that are up to `current_date` from each csv file in `infolder` and save into `outfolder`.
    Increase the `current_date` by 1.
    """
    global current_date, root_path

    if current_date > LAST_DATE:
        scheduler.pause()
        return 

    infolder = os.path.join(root_path, infolder)
    outfolder = os.path.join(root_path, outfolder)
    for filename in os.listdir(infolder):
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
        date = datetime.strptime(line.split(',')[0], '%d/%m/%Y')
        
        # Up to the current date
        if date > current_date:
            break
        
        outlines.append(line.strip())
    
    with open(outfile, 'w') as f:
        f.write('\n'.join(outlines))

# A recurrent job
scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(generate_data, 'interval', seconds=5)


@blueprint.route('/start', methods=['GET'])
def start():
    global current_date, root_path
    root_path = current_app.root_path

    # Start if hasn't
    if scheduler.state == STATE_STOPPED:
        current_date = datetime(2020, 4, 1)
        scheduler.start()
        return Response(f'Simulation of data stream has started. Starting from {current_date:%d/%m/%Y}, daily data will come every 5 seconds.', mimetype='application/json')
    
    # Resume if paused
    if scheduler.state == STATE_PAUSED:
        current_date = datetime(2020, 4, 1)
        scheduler.resume()
        return Response(f'Simulation of data stream has started. Starting from {current_date:%d/%m/%Y}, daily data will come every 5 seconds.', mimetype='application/json')

@blueprint.route('/status', methods=['GET'])
def status():
    if scheduler.state == STATE_STOPPED:
        return Response(f'Simulation has not started.', mimetype='application/json')
    
    if scheduler.state == STATE_PAUSED:
        return Response(f'Simulation has paused. Current date is: {current_date:%d/%m/%Y}.', mimetype='application/json')
    
    if scheduler.state == STATE_RUNNING:
        return Response(f'Simulation is running. Current date is: {current_date:%d/%m/%Y}.', mimetype='application/json')

@blueprint.route('/stop', methods=['GET'])
def stop():
    scheduler.pause()
    return Response('Simulation of data stream has stopped.', mimetype='application/json')

@blueprint.route('/resume', methods=['GET'])
def resume():
    scheduler.resume()
    return Response(f'Simulation has resumed. Current date is {current_date:%d/%m/%Y}.', mimetype='application/json')
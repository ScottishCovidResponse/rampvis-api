import os
import json

from flask import Response, current_app
from app.process_data import blueprint
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.schedulers.base import STATE_STOPPED, STATE_RUNNING, STATE_PAUSED
import pandas as pd

from algorithms.franck import compute_metrics

METRICS = ['ZNCC', 'pearsonr', 'spearmanr', 'kendalltau', 'SSIM', 'PSNR', 'MSE', 'NRMSE', 'ME', 'MAE', 'MSLE', 'MedAE', 'f-test'] 
WINDOW = 'none'

CSV_DYNAMIC_DATA = '../../csv-data-dynamic/scotland'
METRICS_PATH = '../../csv-data-derived-metrics/scotland'

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

scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(save_metrics, 'interval', seconds=3)


@blueprint.route('/start', methods=['GET'])
def start():
    global root_path
    root_path = current_app.root_path

    if not os.path.exists(os.path.join(root_path, METRICS_PATH)):
        os.makedirs(os.path.join(root_path, METRICS_PATH))

    scheduler.start()
    return Response(f'Simulation of computing derived data has started.', mimetype='application/json')

@blueprint.route('/status', methods=['GET'])
def status():
    if scheduler.state == STATE_STOPPED:
        return Response('Simulation has not started.', mimetype='application/json')
    
    if scheduler.state == STATE_PAUSED:
        return Response(f'Simulation has paused.', mimetype='application/json')
    
    if scheduler.state == STATE_RUNNING:
        return Response('Simulation is running.', mimetype='application/json')

@blueprint.route('/stop', methods=['GET'])
def stop():
    scheduler.pause()
    return Response('Simulation of computing derived data has stopped.', mimetype='application/json')

@blueprint.route('/resume', methods=['GET'])
def resume():
    scheduler.resume()
    return Response(f'Simulation has resumed.', mimetype='application/json')

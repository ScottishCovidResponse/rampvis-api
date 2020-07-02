from flask import Response
import json
from apscheduler.schedulers.background import BackgroundScheduler

from app.process_data import blueprint

count = 0
def task():
    global count
    scheduler.print_jobs()
    print('Count: ', count)
    count += 1


scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(task, 'interval', seconds=5)


@blueprint.route('/start', methods=['GET'])
def start():
    scheduler.start()
    return Response(json.dumps({}), mimetype='application/json')


@blueprint.route('/stop', methods=['GET'])
def stop():
    scheduler.shutdown()
    return Response(json.dumps({}), mimetype='application/json')

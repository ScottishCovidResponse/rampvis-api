from flask import Response
import json
from apscheduler.schedulers.background import BackgroundScheduler

from app.data_fetch import blueprint

scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(lambda: scheduler.print_jobs(), 'interval', seconds=5)


@blueprint.route('/start', methods=['GET'])
def start():
    scheduler.start()
    return Response(json.dumps({}), mimetype='application/json')


@blueprint.route('/stop', methods=['GET'])
def stop():
    scheduler.shutdown()
    return Response(json.dumps({}), mimetype='application/json')

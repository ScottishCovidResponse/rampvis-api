from flask import current_app, Response, request, abort
import os
import json

from algorithms.franck import compute_metrics
from app.correlation_dynamic import blueprint

METRICS_PATH = '../../csv-data-derived-metrics'

@blueprint.route('/', methods=['GET'])
def query():
    var1 = request.args.get('var1', None)
    var2 = request.args.get('var2', None)

    if var1 is None or var2 is None:
        abort(400, 'Required parameters: var1, var2')

    # Look up in the database
    filename = var1.replace('/', '.') + '___' + var2.replace('/', '.')
    filepath = os.path.join(current_app.root_path, METRICS_PATH, filename)

    try:
        f = open(filepath)
        response = Response(f.read(), mimetype='application/json')
    except IOError:
        response = Response(json.dumps({'message': f'Something went wrong.'}), mimetype='application/json')

    return response

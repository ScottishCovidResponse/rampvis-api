from flask import Response, request, abort, Blueprint
from flask import current_app

import os
import json
import pandas as pd
from ..algorithms import compute_metrics

correlation_bp = Blueprint(
    'correlation_bp',
    __name__,
    url_prefix='/stat/v1/correlation',
)


@correlation_bp.route('/', methods=['GET'])
def query():
    var1 = request.args.get('var1', None)
    var2 = request.args.get('var2', None)
    metrics = request.args.get('metrics', None)
    window = request.args.get('smooth', 'none')

    if var1 is None or var2 is None or metrics is None:
        abort(400, 'Required parameters: var1, var2, metrics')

    try:
        df1 = variable_to_df(var1)
        df2 = variable_to_df(var2)
    except IOError:
        return Response(json.dumps({'message': f'Data is not available'}), mimetype='application/json')

    metrics = metrics.split(',')

    try:
        result = compute_metrics(df1, df2, metrics, window)
    except Exception as v:
        abort(400, v)

    # Convert to list for serialisation
    for m in metrics:
        result[m] = result[m].tolist()

    response = Response(json.dumps(result), mimetype='application/json')
    return response


def variable_to_df(var):
    config = current_app.config

    filepath = os.path.join(config.get('DATA_PATH_V04'), var + '.csv')
    print(filepath)
    return pd.read_csv(filepath)

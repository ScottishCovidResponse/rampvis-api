from flask import Blueprint, current_app, Response, request, abort
import os
import json
import pandas as pd
from algorithms.franck import compute_metrics

correlation = Blueprint('correlation', __name__)

CSV_DATA_PATH = '../../csv-data'

@correlation.route('/', methods=['GET'])
def query():
    var1 = request.args.get('var1', None)
    var2 = request.args.get('var2', None)
    metrics = request.args.get('metrics', None)
    window = request.args.get('smooth', 'none')

    if var1 is None or var2 is None or metrics is None: 
        abort(400, 'Required parameters: var1, var2, metrics')

    df1 = variable_to_df(var1)
    df2 = variable_to_df(var2)

    try:
        result = compute_metrics(df1, df2, metrics, window)
    except Exception as v:
        abort(400, v)

    response = Response(json.dumps(result), mimetype='application/json')
    return response

def variable_to_df(var):
    filepath = os.path.join(current_app.root_path, CSV_DATA_PATH, var + '.csv')
    return pd.read_csv(filepath)
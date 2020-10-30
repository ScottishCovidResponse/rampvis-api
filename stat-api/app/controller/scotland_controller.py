from flask import current_app, Response, request, abort, Blueprint
import os
import json
import pandas as pd
from app.services.algorithms.algorithm import mse, f_test, pearson_correlation

scotland_bp = Blueprint(
    'scotland_bp',
    __name__,
    url_prefix='/stat/v1/scotland/',
)

config = current_app.config


@scotland_bp.route('/nhs-board/', methods=['GET'])
def query():
    table = request.args.get('table', None)
    metrics = request.args.get('metrics', None)

    if table is None or metrics is None:
        abort(400, 'Required parameters: table, metrics')

    if metrics == 'mse':
        return get_metric(mse, table + '.csv')
    elif metrics == 'f_test':
        return get_metric(f_test, table + '.csv')
    elif metrics == 'pearson_correlation':
        return get_metric(pearson_correlation, table + '.csv')
    else:
        abort(400, 'Not implemented parameters: metrics = ' + metrics)


def get_metric(metric_fn, filename):
    """Return a response applying a function on a data file."""
    df = process_csv_data(filename)
    result = metric_fn(df)
    response = Response(json.dumps(result), mimetype='application/json')
    return response


def process_csv_data(filename: str):
    """Return a dataframe from a relative filename."""
    filepath = os.path.join(config.get('DATA_PATH_V04'), filename)
    df = pd.read_csv(filepath)
    df.replace('*', 0, inplace=True)
    df.drop(columns=['date'], axis=1, inplace=True)
    df = df.astype(int)
    print(df.info())
    return df

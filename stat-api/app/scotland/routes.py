from flask import current_app, Response
import os
import json
import pandas as pd

from app.scotland import blueprint
from algorithms.algorithm import mse, f_test, pearson_correlation

CSV_DATA_PATH = '../../csv-data'


@blueprint.route('/cumulative/mse', methods=['GET'])
def get_mse():
    return get_metric(mse, 'cumulative_cases.csv')


@blueprint.route('/cumulative/f-test', methods=['GET'])
def get_f_test():
    return get_metric(f_test, 'cumulative_cases.csv')


@blueprint.route('/cumulative/pearson-correlation', methods=['GET'])
def get_pearson_correlation():
    return get_metric(pearson_correlation, 'cumulative_cases.csv')


def get_metric(metric_fn, filename):
    """Return a response applying a function on a data file."""
    df = process_csv_data(filename)
    result = metric_fn(df)
    response = Response(json.dumps(result), mimetype='application/json')
    return response


def process_csv_data(filename: str):
    """Return a dataframe from a relative filename."""
    filepath = os.path.join(current_app.root_path, CSV_DATA_PATH, filename)
    df = pd.read_csv(filepath)
    df.replace('*', 0, inplace=True)
    df.drop(columns=['date'], axis=1, inplace=True)
    df = df.astype(int)
    print(df.info())
    return df

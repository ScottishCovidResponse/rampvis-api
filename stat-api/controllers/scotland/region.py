from flask import Blueprint, current_app, Response
import os
import json

import pandas as pd
from algorithms.algorithm import mse, f_test, pearson_correlation

region = Blueprint('region', __name__)

CSV_DATA_PATH = '../../csv-data'

@region.route('/cumulative/mse', methods=['GET'])
def get_mse():
    get_metric(mse, 'cumulative_cases.csv')

@region.route('/cumulative/f-test', methods=['GET'])
def get_f_test():
    get_metric(f_test, 'cumulative_cases.csv')

@region.route('/cumulative/pearson-correlation', methods=['GET'])
def get_pearson_correlation():
    get_metric(pearson_correlation, 'cumulative_cases.csv')

def get_metric(fn, filename):
    """Return a response applying a function on a data file."""
    df = process_csv_data(filename)
    result = fn(df)
    response = Response(json.dumps(obj), mimetype='application/json')
    return reponse

def process_csv_data(filename:str):
    """Return a dataframe from a relative filename."""
    filepath = os.path.join(current_app.root_path, CSV_DATA_PATH, filename)
    df = pd.read_csv(filepath, sep=',')
    df.replace('*', 0, True)
    df.drop(columns=['date'], axis=1, inplace=True)
    df = df.astype(int)
    return df
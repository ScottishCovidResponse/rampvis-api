from flask import Blueprint, current_app, Response
import os
import json

import pandas as pd
from algorithms.algorithm import mse, f_test, pearson_correlation

region = Blueprint('region', __name__)

CSV_DATA_PATH = '../../csv-data'


@region.route('/cumulative/mse', methods=['GET'])
def get_mse():
    file = os.path.join(current_app.root_path, CSV_DATA_PATH, 'cumulative_cases.csv')
    # print('get_mse: file: ', file)
    result = mse(read_csv_data(file))

    # print(result)
    return Response(json.dumps(result), mimetype='application/json')


@region.route('/cumulative/f-test', methods=['GET'])
def get_f_test():
    file = os.path.join(current_app.root_path, CSV_DATA_PATH, 'cumulative_cases.csv')
    # print('get_mse: file: ', file)
    result = f_test(read_csv_data(file))

    # print(result)
    return Response(json.dumps(result), mimetype='application/json')


@region.route('/cumulative/pearson-correlation', methods=['GET'])
def get_pearson_correlation():
    file = os.path.join(current_app.root_path, CSV_DATA_PATH, 'cumulative_cases.csv')
    # print('get_mse: file: ', file)
    result = pearson_correlation(read_csv_data(file))

    # print(result)
    return Response(json.dumps(result), mimetype='application/json')


def read_csv_data(file):
    df = pd.read_csv(file, sep=',')
    df.replace('*', 0, True)
    df.drop(columns=['date'], axis=1, inplace=True)
    df = df.astype(int)
    return df

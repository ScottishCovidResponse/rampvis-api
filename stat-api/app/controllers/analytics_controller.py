from flask import Response, request, abort, Blueprint
from flask import current_app

import os
import json
import pandas as pd

analytics_bp = Blueprint(
    'analytics_bp',
    __name__,
    url_prefix='/stat/v1',
)

config = current_app.config


@analytics_bp.route('/percentiles', methods=['GET'])
def query():
    response = Response('from analytics', mimetype='application/json')
    return response

def generate_aggregated_file(df):
    results = {}

    results['x'] = {
        'label': 'day',
        'values': next(iter(df.groupby('iter')['day']))[1].values.tolist()
    }

    quantiles = [0.95, 0.75, 0.5, 0.25, 0.05]
    results['percentiles'] = [f'{q:.0%}' for q in quantiles]

    cols = df.columns.difference(['iter', 'day'])
    results['ys'] = []
    for c in cols:
        results['ys'].append({
            'label': c,
            'values': [df.groupby('day')[c].quantile(q).tolist() for q in quantiles]
        })
        
    for ys in results['ys']:
        for d in results['x']['values']:
            for i in range(4):
                assert ys['values'][i] > ys['values'][i + 1]

    with open('percentiles.json', 'w') as f:
        json.dump(results, f)

def generate_age_group_file(df, col, n_groups=8):
    "Generate data for visualisation, using only `col` variable."
    df['group'] = df.index % n_groups

    results = {}

    results['x'] = {
        'label': 'day',
        'values': next(iter(df.groupby(['iter', 'group'])['day']))[1].values.tolist()
    }
    
    quantiles = [0.95, 0.75, 0.5, 0.25, 0.05]
    results['percentiles'] = [f'{q:.0%}' for q in quantiles]

    results['ys'] = []
    labels = ['Under 20', '20-29', '30-39', '40-49', '50-59', '60-69', '70+', 'Health Care Workers']
    for c in range(n_groups):
        g = df.query('group == @c')
        results['ys'].append({
            'label': labels[c],
            'values': [g.groupby('day')[col].quantile(q).tolist() for q in quantiles]
        })

    for ys in results['ys']:
        for d in results['x']['values']:
            for i in range(4):
                assert ys['values'][i] > ys['values'][i + 1]
                
    with open('group_percentiles.json', 'w') as f:
        json.dump(results, f)
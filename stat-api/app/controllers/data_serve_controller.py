from flask import Response, request, abort, Blueprint
from flask import current_app

import os
import json
from pathlib import Path

import pandas as pd

from ..algorithms import compute_metrics
from ..utils.naming import component_to_csv_file

data_serve_bp = Blueprint(
    'data_serve_bp',
    __name__,
    url_prefix='/stat/v1/data/',
)

config = current_app.config
folder = Path(config.get('DATA_PATH_LIVE'))

@data_serve_bp.route('/', methods=['GET'])
def query():
    """
    Return data in JSON format.

    Examples:
    - /stat/v1/data?product=records/SARS-CoV-2/scotland/cases-and-management/hospital&component=nhs_health_board_date_covid19_patients_in_hospital_confirmed
    - /stat/v1/data?product=records/SARS-CoV-2/scotland/cases-and-management/hospital&component=nhs_health_board_date_covid19_patients_in_hospital_confirmed&field=Fife
    """
    product = request.args.get('product', None)
    component = request.args.get('component', None)
    field = request.args.get('field', None)

    if product is None or component is None:
        abort(400, 'Required parameters: product, component')

    # Data structure: 
    # - each product is in a folder with subfolders as components
    # - each component is a csv containing all fields
    filename = component_to_csv_file(folder, product, component)
    df = pd.read_csv(filename)

    if field is not None:
        df = df[[field]]
        
    result = df.to_json(orient='records')
    return Response(result)
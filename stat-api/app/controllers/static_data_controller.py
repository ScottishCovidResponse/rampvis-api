import logging

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

import re
import json
import pandas as pd

from flask import Response, current_app, Blueprint
from ..utils import validate_token
from ..services import download_to_csvs

static_data_bp = Blueprint(
    'static_data_bp',
    __name__,
    url_prefix='/stat/v1/static_data/',
)

config = current_app.config

nhs_code_to_name = {
    'S08000015': 'Ayrshire and Arran',
    'S08000016': 'Borders',
    'S08000017': 'Dumfries and Galloway',
    'S08000018': 'Fife',
    'S08000019': 'Forth Valley',
    'S08000020': 'Grampian',
    'S08000021': 'Greater Glasgow and Clyde',
    'S08000022': 'Highland',
    'S08000023': 'Lanarkshire',
    'S08000024': 'Lothian',
    'S08000025': 'Orkney',
    'S08000026': 'Shetland',
    'S08000027': 'Tayside',
    'S08000028': 'Western Isles',
    'S08000029': 'Fife',
    'S08000030': 'Tayside',
    'S08000031': 'Greater Glasgow and Clyde',
    'S08000032': 'Lanarkshire'
}

def download_data():
    """
    Download data products from https://data.scrc.uk/.
    """
    try:
        with open('manifest/static_manifest.json') as f:
            manifest = json.load(f)
            download_to_csvs(manifest, config.get('DATA_PATH_RAW'), config.get('DATA_PATH_STATIC')) 
    except Exception as e:
        logger.error(e, exc_info=True)

def process_health_board(infile, outfile, is_gender):
    df = pd.read_csv(infile, index_col='health board')
    df.to_csv(outfile)

    # 1. Grouping
    # 91: the last group is 90+
    age_groups = [range(0,1), range(1,15), range(15,45), range(45,65), range(65,75), range(75,85), range(85,91)]
    old_cols = df.columns
    prefixes = ['males___', 'females___'] if is_gender else ['']
    for prefix in prefixes:
        for group in age_groups:
            cols = [c for c in df.columns if c.startswith(prefix) and int(re.search(r'(\d+)', c).group()) in group]
            assert len(cols) == len(list(group))
            m1, m2 = min(list(group)), max(list(group))
            suffix = f'{m1} years and over' if m1 == 85 else f'{m1} years' if m1 == m2 else f'{m1}-{m2} years'
            new_col = (prefix + suffix).replace('males', 'male')
            df[new_col] = df[cols].sum(axis=1)
    df.drop(columns=old_cols, inplace=True)
    
    # 2. Rename index
    df.index = df.index.map(nhs_code_to_name)
    df = df.sort_index()

    df.to_csv(outfile)

@static_data_bp.route('/', methods=['GET'])
@validate_token
def start():
    download_data()
    folder = config.get('DATA_PATH_STATIC') + '/human/demographics/population/scotland/'
    process_health_board(folder + 'health board_age_genders.csv',
                         folder + 'health board_age_genders_processed.csv',
                         is_gender=True)
    process_health_board(folder + 'health board_age_persons.csv',
                         folder + 'health board_age_persons_processed.csv',
                         is_gender=False)
    return Response('Demographics data downloaded.')
import requests
from pathlib import Path
import pandas as pd

from app.utils.naming import component_to_csv_file, format_component_name

def create_stream(p, c, col=None):
    stream = {
        'urlCode': 'API_PY',
        'endpoint': f'/data/?product={p["product"]}&component={c["name"]}',
        'dataType': c['dataType'],
        'keywords': c['keywords'],
        'description': c.get('description', '')
    }
    
    if col:
        stream['endpoint'] += f'&field={col}'
        
        if p['product'] == 'ons/england/mortality':
            stream['description'] = col.split('___')[0] + ', ' + c['description']
        else:
            desc = c.get('description', '')
            if desc:
                stream['description'] = col + ', ' + desc
            else:
                stream['description'] = col
                
    if c.get('keys'):
        stream['endpoint'] += f'&keys={c["keys"]}'
    if c.get('values'):
        stream['endpoint'] += f'&values={c["values"]}'
    if c.get('format'):
        stream['endpoint'] += f'&format={c["format"]}'
                
    return stream

def generate_streams(manifest, names=None, folder='../../data/live/', split=True):
    folder = Path(folder)
    streams = []
    for p in manifest:
        for c in p['components']:
            if names and c['name'] not in names:
                continue
                
            # Register the component
            filepath = component_to_csv_file(folder, p['product'], c['name'])
            df = pd.read_csv(filepath, index_col=0)
            streams.append(create_stream(p, c))
            
            # Each field in a component csv file should be registered separately as individual data streams
            if split and len(df.columns) > 1:
                for col in df.columns:
                    stream = create_stream(p, c, col)
                    col = format_component_name(col)
                    # female___1-14 years: 2 separate keywords
                    extra_keywords = col.split('___') if '___' in col else [col]
                    stream['keywords'] = stream['keywords'] + extra_keywords
                    streams.append(stream)
    return streams

def test_endpoints(streams, base_url='http://localhost:4010/stat/v1'):
    # Can the endpoints be accessed?
    for s in streams:
        response = requests.get(base_url + s['endpoint'])
        assert response.status_code == 200
        
def get_token(prod=False):
    url = 'https://vis.scrc.uk/api/v1/auth/login' if prod else 'http://localhost:4000/api/v1/auth/login'
    token = None
    try:
        res = requests.post(url, {'password': "", 'email': ""})
        if res and res.json() and res.json()['token']:
            token = res.json()['token']

    except ConnectionError as e:
        print("token request: error = ", e)

    except Exception as e:
        print("Something went wrong", e)

    else:
        return token

def register(data, token, prod=False):
    url = 'https://vis.scrc.uk/api/v1/ontology/data' if prod else 'http://localhost:4000/api/v1/ontology/data'
    headers = {'Authorization': 'Bearer ' + token}
    try:
        response = requests.post(url, data, headers=headers)
        response = response.json()
        if 'message' in response:
            print(response)
    except Exception as e:
        print(e)
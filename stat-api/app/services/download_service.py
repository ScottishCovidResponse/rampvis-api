import json
import os
import re
from pathlib import Path

from dateutil.parser import isoparse

import h5py
import pandas as pd
import numpy as np

from data_pipeline_api.registry.downloader import Downloader

def clean_column_name(s):
    return s.lower().replace(' - ', '_').replace('-', '_').replace(' ', '_')

def to_df(f, key):
    print('processing', key)
    names = [d.decode() for d in f[key]['Dimension_2_names']]
    try:
        # names are dates
        date = isoparse(names[0])
        dates = names
        columns = [d.decode() for d in f[key]['Dimension_1_names']]
        values = np.array(f[key]['array'])
        if 'Dimension_3_names' in f[key]:
            extra_columns = [d.decode() for d in f[key]['Dimension_3_names']]
            dfs = []
            for c in extra_columns:
                df = pd.DataFrame(data=values[0], index=dates, columns=columns, dtype=int)
                if key == 'age_group/week/gender-country-covid_related_deaths':
                    df['Gender'] = c
                dfs.append(df)
            df = pd.concat(dfs)
        else:
            # Try Int64 first which is the same as int but can store NaN
            try:
                df = pd.DataFrame(data=values, index=dates, columns=columns, dtype='Int64')
            except Exception:
                df = pd.DataFrame(data=values, index=dates, columns=columns, dtype='Float64')
        df.index.name = 'date'
        # print('processed', key)
    except Exception:
        key_values = f[key]['array']
        if len(key_values) > 1:
            columns = [d.decode() for d in key_values[0]]
            values = np.array(key_values[1:], dtype='int')
        else:
            # week-persons-scotland-all_deaths-averaged_over_5years
            columns = [d.decode() for d in f[key]['Dimension_1_names']] 
            values = np.array(key_values, dtype='int')
        df = pd.DataFrame(data=values, columns=columns)
    return df

def process_h5(path, live_path, component_names):
    f = h5py.File(path, 'r')
    for c in component_names:
        df = to_df(f, c)
        filename = re.sub('[\-/]', '_', c) + '.csv'
        if isinstance(df.index, pd.RangeIndex):
            df.to_csv(Path(live_path) / filename, index=None)
        else:
            df.to_csv(Path(live_path) / filename)
    
def download_to_csvs(manifest, raw_path, live_path):
    "Download the latest file of a data product, convert h5 to csv and save it."
    for p in manifest:
        component_names = [c['name'] for c in p['components']]
        download_product(p['product'], component_names, raw_path, live_path)
    print('CSV convert completed.')
    
def download_product(product_name, component_names, raw_path, live_path):
    downloader = Downloader(data_directory=raw_path)
    downloader.add_data_product(namespace='SCRC', data_product=product_name)
    downloader.download()

    folder = Path(raw_path) / product_name
    folder = folder/max(os.listdir(folder))
    h5s = [filename for filename in os.listdir(folder) if filename.endswith('.h5')]
    filename = h5s[0]
    process_h5(folder/filename, live_path, component_names)
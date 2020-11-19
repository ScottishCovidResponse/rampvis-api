import json
import os
import re
from pathlib import Path

import h5py
import pandas as pd
import numpy as np

from data_pipeline_api.registry.downloader import Downloader

def clean_column_name(s):
    return s.lower().replace(' - ', '_').replace('-', '_').replace(' ', '_')

def to_df(f, key):
    dates = [d.decode() for d in f[key]['Dimension_2_names']]
    columns = [d.decode() for d in f[key]['Dimension_1_names']]
    values = np.array(f[key]['array'])
    # Try Int64 first which is the same as int but can store NaN
    try:
        df = pd.DataFrame(data=values, index=dates, columns=columns, dtype='Int64')
    except Exception:
        df = pd.DataFrame(data=values, index=dates, columns=columns, dtype='Float64')
    df.index.name = 'date'
    return df

def process_h5(path, live_path, component_names):
    f = h5py.File(path, 'r')
    for c in component_names:
        df = to_df(f, c)
        filename = re.sub('[\-/]', '_', c) + '.csv'
        df.to_csv(Path(live_path) / filename)
    
def download_to_csvs(manifest, raw_path, live_path):
    "Download the latest file of a data product, convert h5 to csv and save it."
    for p in manifest:
        component_names = [c['name'] for c in p['components']]
        download_product(p['product'], component_names, raw_path, live_path)

def download_product(product_name, component_names, raw_path, live_path):
    downloader = Downloader(data_directory=raw_path)
    downloader.add_data_product(namespace='SCRC', data_product=product_name)
    downloader.download()

    folder = Path(raw_path) / product_name
    folder = folder/max(os.listdir(folder))
    h5s = [filename for filename in os.listdir(folder) if filename.endswith('.h5')]
    filename = h5s[0]
    process_h5(folder/filename, live_path, component_names)
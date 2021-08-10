import json
import os
import re
import shutil
from pathlib import Path
from dateutil.parser import isoparse

import h5py
import pandas as pd
import numpy as np

from data_pipeline_api.registry.downloader import Downloader
from ..utils.naming import format_component_name

def to_df(f, key):
    print('converting', key)
    values = np.array(f[key]['array'])
    names_1 = [d.decode() for d in f[key]['Dimension_1_names']]
    title_1 = list(f[key]['Dimension_1_title'])[0].decode()
    names_2 = [d.decode() for d in f[key]['Dimension_2_names']]
    title_2 = list(f[key]['Dimension_2_title'])[0].decode()
    index_is_date = False
    try:
        isoparse(names_2[0])
        # Succeeded, names_2 are dates and names_1 are columns
        index_is_date = True
        indices = names_2
        index_name = title_2
        columns = names_1
    except Exception as e:
        # Failed, names_2 are columns and names_1 are normal indices.
        indices = names_1
        index_name = title_1
        columns = names_2

    if 'Dimension_3_names' in f[key]:
        extra_columns = [d.decode() for d in f[key]['Dimension_3_names']]
        data_dict = {}
        for i1, c1 in enumerate(extra_columns):
            for i2, c2 in enumerate(columns):
                data_dict[c1 + '___' + c2] = values[i1,:,i2] if index_is_date else values[i1,i2,:]
                
        df = pd.DataFrame(data_dict, index=indices, dtype='Int64')
    else:
        # The values are aslo transposed in case of 2 dimensions and non-date
        if not index_is_date:
            values = values.T

        # Try Int64 first which is the same as int but can store NaN
        try:
            df = pd.DataFrame(data=values, index=indices, columns=columns, dtype='Int64')
        except Exception:
            df = pd.DataFrame(data=values, index=indices, columns=columns, dtype='Float64')
            
    df.index.name = index_name
    assert df.values.shape == (len(df), len(df.columns))
    
    return df

def process_h5(path, folder, static_path, components):
    f = h5py.File(path, 'r')
    for c in components:
        if 'normalized' in c:
            df = to_df(f, c['source'])
            filename = format_component_name(c['name'])

            pop_file = Path(static_path)/c['normalized']
            pop_df = pd.read_csv(pop_file, index_col=c['col_name'])
            norm_df = df.copy()
            for col in df.columns:
                norm_df.loc[:,col] = norm_df.loc[:,col] / pop_df.loc[col].values[0] * 100000
            norm_df.to_csv(folder/(filename + '.csv'))
        else:
            name = c['name']
            df = to_df(f, name)
            filename = format_component_name(name)
            df.to_csv(folder/(filename + '.csv'))

def download_to_csvs(manifest, raw_path, live_path, static_path):
    "Download the latest file of a data product, convert h5 to csv and save it."
    for p in manifest:
        download_product(p['product'], p['components'], raw_path, live_path, static_path)
    print('Data download and CSV conversion completed.')
    
def download_product(product_name, components, raw_path, live_path, static_path):
    # print('\n-----\ndownloading', product_name)
    # downloader = Downloader(data_directory=raw_path)
    # downloader.add_data_product(namespace='SCRC', data_product=product_name)
    # downloader.download()

    # # Recreate a subfolder
    subfolder = Path(live_path) / product_name
    shutil.rmtree(subfolder, ignore_errors=True)
    os.makedirs(subfolder)

    folder = Path(raw_path) / product_name
    folder = folder/max(os.listdir(folder))
    h5s = [filename for filename in os.listdir(folder) if filename.endswith('.h5')]
    filename = h5s[0]
    process_h5(folder/filename, subfolder, static_path, components)

def download_owid(folder):
    print('Download owid ...')
    url = 'https://covid.ourworldindata.org/data/owid-covid-data.csv'
    df = pd.read_csv(url)
    df.to_csv(Path(folder)/'owid/full.csv', index=False)
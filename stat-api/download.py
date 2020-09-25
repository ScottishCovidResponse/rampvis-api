import json
import os
from pathlib import Path

import h5py
import pandas as pd
import numpy as np

from data_pipeline_api.registry.downloader import Downloader

DATA_DOWNLOAD_PATH = '../data'

def generate_components(f):
    components = []
    for k in f:
        one_level = all(isinstance(f[k][k2], h5py.Dataset) for k2 in f[k])
        if one_level:
            components.append(k)
        else:
            # Assume that if it's not one level, it's two level
            for k2 in f[k]:
                components.append(k + '/' + k2)
    return components

def to_df(f, key):
    dates = [d.decode() for d in f[key]['Dimension_2_names']]
    columns = [d.decode() for d in f[key]['Dimension_1_names']]
    values = np.array(f[key]['array'])
    df = pd.DataFrame(data=values, index=dates, columns=columns, dtype='Int64')
    df.index.name = 'date'
    return df

def process_h5(path):
    f = h5py.File(path, 'r')
    components = generate_components(f)
    for c in components:
        df = to_df(f, c)
        folder = Path(os.path.dirname(path))
        filename = c.replace('/', '--') + '.csv'
        df.to_csv(folder/filename)
    
def download_to_csvs(product_name):
    "Download the latest file of a data product, convert h5 to csv and save it."
    downloader = Downloader(data_directory=DATA_DOWNLOAD_PATH)
    downloader.add_data_product(namespace='SCRC', data_product=product_name)
    downloader.download()

    folder = Path(DATA_DOWNLOAD_PATH)/product_name
    folder = folder/max(os.listdir(folder))
    filename = os.listdir(folder)[0]
    process_h5(folder/filename)

if __name__ == '__main__':
    download_to_csvs('records/SARS-CoV-2/scotland/cases-and-management/testing')
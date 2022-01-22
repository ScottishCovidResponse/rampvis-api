import json
import os
import shutil
from pathlib import Path
from dateutil.parser import isoparse
import requests
from urllib.request import urlopen
from io import BytesIO
from zipfile import ZipFile
from urllib.parse import urlparse, parse_qs
from loguru import logger

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
    folder = Path(folder)/'owid'
    folder.mkdir(exist_ok=True)
    df.to_csv(folder/'full.csv', index=False)

def download_open_data_qf(base_url, folder, filename):
    url = f'https://www.opendata.nhs.scot/dataset/{base_url}/download'
    df = pd.read_csv(url)
    qf_columns = [c for c in df.columns if c.endswith('QF')]
    df = df.drop(columns=['Country'] + qf_columns)
    folder.mkdir(exist_ok=True)
    df.to_csv(folder/filename, index=False)

def download_open_data(folder):
    print('Download opendata ...')
    
    download_open_data_qf(
        '6dbdd466-45e3-4348-9ee3-1eac72b5a592/resource/9b99e278-b8d8-47df-8d7a-a8cf98519ac1',
        Path(folder)/'opendata/scotland/vaccination',
        'daily_sex_agegroup.csv'
    )
    
    download_open_data_qf(
        'covid-19-in-scotland/resource/9393bd66-5012-4f01-9bc5-e7a10accacf4',
        Path(folder)/'opendata/scotland/case_trends',
        'daily_sex_agegroup.csv'
    )

def save_code(df, save_to):
    area_code = df.iloc[0]['areaCode']
    
    # Add a subfolder right before filename
    save_to = Path(save_to)
    new_save_to = save_to.parent/area_code.lower()
    new_save_to.mkdir(parents=True, exist_ok=True)
    
    df.to_csv(new_save_to/save_to.name, index=None)

def download_urls(urls, folder):
    print('Download from URLs ...')
    folder = Path(folder)
    for url in urls:
        try:
            # Convert to lower case to make it consistent with previous convention
            save_to = str(folder/url['save_to']).lower()
            logger.info("Saving file from URL to: " + save_to)
            parentfolder = Path(save_to).parents[0]
            parentfolder.mkdir(parents=True, exist_ok=True)  # Create directory for file if not already present

            if url['name'] == 'phe':
                df = pd.read_csv(url['url'], encoding='iso-8859-1')

                # Split the file based on area code
                area_types = parse_qs(urlparse(url['url']).query).get('areaType')
                if area_types and len(area_types) and area_types[0] != 'overview':
                    df.groupby('areaCode').apply(lambda x: save_code(x, save_to))
                else:
                    df.to_csv(save_to, index=None)
            elif url['url'].lower().endswith('.csv'):
                df = pd.read_csv(url['url'])
                df.to_csv(save_to, index=None)
            elif url['url'].lower().endswith('.json'):
                r = requests.get(url['url'])
                with open(save_to, "w", encoding="utf-8") as f:
                    json.dump(r.json(), f, ensure_ascii=False, indent=4)
            elif url['url'].lower().endswith('.zip'): #download and unzip zip files
                http_response = urlopen(url['url'])
                zipfile = ZipFile(BytesIO(http_response.read()))
                zipinfos = zipfile.infolist()
                # iterate through each file and remove the top directory
                for zipinfo in zipinfos:
                    zipinfo.filename = zipinfo.filename.removeprefix(zipinfo.filename.split('/')[0])  #Removes the top level folder when extracting
                    zipfile.extract(zipinfo, path=save_to)
        except Exception as e:
            logger.info("Failed to download a file from URL")
            logger.exception(e)

    print('Download from URLs has finished')
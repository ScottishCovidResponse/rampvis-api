import pandas as pd
import from app.algorithms.sim_search.cube_functions import cube_master,cube_sample,country_filter

def to_cube(df:pd.DataFrame) -> pd.DataFrame:
    df = pd.read_csv('full.csv',parse_dates=[3]) # loads full owid data and parses dates (4th column)
    df.drop(df.columns[46:],axis=1,inplace=True) # remove categorical variables
    df.drop(['reproduction_rate'],axis=1,inplace=True) # remove reproduction rate
    smoothed = []  # list to remove all smoothed lines
    for i in df.columns:
        if "smoothed" in i:
        smoothed.append(i)
    df.drop(smoothed,axis=1,inplace=True)
    df = cube_master(df) 
    return df
    
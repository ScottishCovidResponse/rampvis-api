import pandas as pd
from app.algorithms.sim_search.cube_functions import cube_master,clean_df

def to_cube(df:pd.DataFrame) -> pd.DataFrame:
    """  
    Transforms raw data to data-cube includes pre-processing and transformation functions above
    
    Args
    :df: owid raw data (https://github.com/owid/covid-19-data/blob/master/public/data/owid-covid-data.csv) 
    Return
    :cube: data cube to run time-series similarity search 
    
    """
    populationLookUp = {}
    continentLookUp = {}
    for i in range(len(df)):
        populationLookUp[df['location'].iloc[i]] = df['population'].iloc[i]
        continentLookUp[df['location'].iloc[i]] = df['continent'].iloc[i] 
   
    df = clean_df(df)
    cube = cube_master(df) 
    popRow = pd.DataFrame(populationLookUp,index=[0])
    popRow.rename(index={0:"Population"},inplace=True)
    contRow = pd.DataFrame(continentLookUp,index=[0])
    contRow.rename(index={0:"Continent"},inplace=True)
    cube = cube.append(popRow)
    cube = cube.append(contRow)
    return cube
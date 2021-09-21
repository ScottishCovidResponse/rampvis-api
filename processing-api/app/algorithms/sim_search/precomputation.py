import pandas as pd
from app.algorithms.sim_search.cube_functions import cube_master

def to_cube(df:pd.DataFrame) -> pd.DataFrame:
    df.drop(df.columns[46:],axis=1,inplace=True) # remove categorical variables
    df.drop(['reproduction_rate'],axis=1,inplace=True) # remove reproduction rate
    populationLookUp = {} # population lookup for filters
    continentLookUp = {} # continent lookup  for filters
    smoothed = []  # list to remove all smoothed lines
    for i in range(len(df)):
        populationLookUp[df['location'].iloc[i]] = df['population'].iloc[i]
        continentLookUp[df['location'].iloc[i]] = df['continent'].iloc[i] 
    for i in df.columns:
        if "smoothed" in i:
            smoothed.append(i)
    df.drop(smoothed,axis=1,inplace=True)
    cube = cube_master(df) 
    pop_row = pd.DataFrame(populationLookUp,index=[0])
    pop_row.rename(index={0:"Population"},inplace=True)
    cont_row = pd.DataFrame(continentLookUp,index=[0])
    cont_row.rename(index={0:"Continent"},inplace=True)
    cube = cube.append(pop_row)
    cube = cube.append(cont_row)
    return cube
    import pandas as pd
from app.algorithms.sim_search.cube_functions import cube_master

def to_cube(df:pd.DataFrame) -> pd.DataFrame:
    df.drop(df.columns[46:],axis=1,inplace=True) # remove categorical variables
    df.drop(['reproduction_rate'],axis=1,inplace=True) # remove reproduction rate
    populationLookUp = {} # population lookup for filters
    continentLookUp = {} # continent lookup  for filters
    smoothed = []  # list to remove all smoothed lines
    for i in range(len(df)):
        populationLookUp[df['location'].iloc[i]] = df['population'].iloc[i]
        continentLookUp[df['location'].iloc[i]] = df['continent'].iloc[i] 
    for i in df.columns:
        if "smoothed" in i:
            smoothed.append(i)
    df.drop(smoothed,axis=1,inplace=True)
    cube = cube_master(df) 
    pop_row = pd.DataFrame(populationLookUp,index=[0])
    pop_row.rename(index={0:"Population"},inplace=True)
    cont_row = pd.DataFrame(continentLookUp,index=[0])
    cont_row.rename(index={0:"Continent"},inplace=True)
    cube = cube.append(pop_row)
    cube = cube.append(cont_row)
    return cube
    
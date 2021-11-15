import pandas as pd
import datetime
import numpy as np

from loguru import logger

def clean_df(df:pd.DataFrame)->pd.DataFrame:
    """
    removes unwanted features such as categorical variables, smoothed lines
    
    Args
    :df: owid raw data (https://github.com/owid/covid-19-data/blob/master/public/data/owid-covid-data.csv)
    
    Return
    :df: filtered data
    
    """ 
    dfClean = df.copy()
    dfClean.drop(dfClean.columns[50:],axis=1,inplace=True) # remove categorical variables
    dfClean.drop(['iso_code','population','continent','population_density','reproduction_rate'],axis=1,inplace=True)
    dfClean = dfClean[dfClean.columns.drop(list(dfClean.filter(regex='smoothed')))]
    return dfClean

def cube_sample(countryName:str,df:pd.DataFrame)->pd.DataFrame:   
    """
    filters out data by country name
    handles NaN
    adds derived data streams
    creates the cube format for the selected country (index : date , columns : country, values : objects including multiple data streams)
    
    Args
    :df: filtered owid data from clean_df function
    :countryName: name of the country
    
    Return
    :countryData: data for the given country 
    
    """ 
    countIndex = df.groupby('location').groups[countryName].values
    countryData = df.loc[countIndex].copy(deep = True)
    countryData.set_index('date',inplace = True)  
    # adding derived data streams for each country
    countryData["new_cases"] = countryData["new_cases"].rolling(14).mean()
    countryData["new_deaths"] = countryData["new_deaths"].rolling(14).mean()
    countryData["weekly_cases"] = countryData["new_cases"].rolling(7).sum()
    countryData["biweekly_cases"] = countryData["new_cases"].rolling(14).sum()
    countryData["weekly_cases_per_million"] = countryData["new_cases_per_million"].rolling(7).sum()
    countryData["biweekly_cases_per_million"] = countryData["new_cases_per_million"].rolling(14).sum()
    countryData["weekly_cases_rate"] = countryData["weekly_cases"].diff(periods=7) / countryData["weekly_cases"] * 100
    countryData["biweekly_cases_rate"] = countryData["biweekly_cases"].diff(periods=14) / countryData["biweekly_cases"] * 100
    
    countryData["weekly_deaths"] = countryData["new_deaths"].rolling(7).sum()
    countryData["biweekly_deaths"] = countryData["new_deaths"].rolling(14).sum()
    countryData["weekly_deaths_per_million"] = countryData["new_deaths_per_million"].rolling(7).sum()
    countryData["biweekly_deaths_per_million"] = countryData["new_deaths_per_million"].rolling(14).sum()
    countryData["weekly_deaths_rate"] = countryData["weekly_deaths"].diff(periods=7) / countryData["weekly_deaths"] * 100
    countryData["biweekly_deaths_rate"] = countryData["biweekly_deaths"].diff(periods=14) / countryData["biweekly_deaths"] * 100
    countryData.fillna(0,inplace=True)
    countryData.replace([np.inf,-np.inf],0,inplace=True)
    countryData = countryData.round(0)
    
    country = countryData['location'][0]
    countryData.drop(['location'],axis=1,inplace=True)
    countryData = countryData[countryData.index > datetime.datetime.strptime("2021-01-01","%Y-%m-%d")]
    masterLst = [] 
    tempDict = {}

    for j in range(len(countryData.index)):
        for i in range(len(countryData.columns)):
            tempDict[countryData.columns[i]] = countryData.iloc[j][i]
        masterLst.append(tempDict)
        tempDict = {}
    data = {country : masterLst}
    cubeSample = pd.DataFrame(index=countryData.index,data=data)
    return cubeSample
 

def cube_master(df:pd.DataFrame)->pd.DataFrame: 
    
    """  
    merges all country cube samples to create the data cube
    
    Args
    :df: filtered owid data from clean_df function
    :countryName: name of the country
    
    Return
    :countryData: data for the given country 
    
    """ 
    logger.info('cube_master will take a few minutes...')
    countryList = df['location'].unique()
    dfLst = []
    for country in countryList:
        logger.info(country)
        dfLst.append(cube_sample(country,df))
        
    return pd.concat(dfLst,axis=1)
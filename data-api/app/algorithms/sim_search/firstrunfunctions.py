import datetime
import pandas as pd
import ast
import numpy as np
from scipy.spatial import distance
from tslearn.metrics import dtw,lcss

def continentTransformer(continentCheck):
    temp  = []
    for i in continentCheck:
        if (continentCheck[i] == True):
            temp.append(i)
    return temp


def advancedfilters(cube:pd.DataFrame,minPopulation:int,continentCheck:list,startDate:datetime.date,endDate:datetime.date)->pd.DataFrame:
    """
    advancedfilters function reduces the search space by date, continent, and minimum population
    
    Args
    :cube: covid data-cub
    :minPopulation: population threshold to include countries
    :continentCheck: continents to include
    :startDate: first date of the search space 
    :endDate: end date of the search space 
    
    Return
    :cube: filtered covid data-cube 
    
    """ 
    cubeFiltered = cube.copy()
    cubeFiltered.fillna(0,inplace=True)
    
    dropped = [] # columns to be dropped by continent and minimum population using last two rows from cube
    
    for i in range(1,len(cubeFiltered.columns)):
        if(cubeFiltered.iloc[-1][i] not in continentCheck or int(float(cubeFiltered.iloc[-2][i])) <= minPopulation):
            dropped.append(cubeFiltered.columns[i])

    cubeFiltered.drop(columns=dropped,inplace=True) # drop columns which do not satisfy filters
    cubeFiltered.drop(cubeFiltered.tail(2).index,inplace=True) # drop last two rows(information on continent and population)
    
    cubeFiltered.set_index(cubeFiltered.columns[0],inplace=True) # set index to date
    cubeFiltered.index = pd.to_datetime(cubeFiltered.index) # parse dates to datetime
    cubeFiltered = cubeFiltered.loc[startDate:endDate] # filter search space by date
    cubeFiltered.index.names = ['Date'] 
    
    return cubeFiltered



def slicer(cube:pd.DataFrame,indicator:str)->pd.DataFrame:
    """
    slicer function creates a new data-frame which includes only selected data stream
    
    Args
    :cube: filtered covid data-cube
    :indicator: data stream for the search
    
    Return
    :cube: sliced covid data-cube
    
    """ 
    cubeNew = cube.copy()
    
    for i in cube.columns:
        for j in range(len(cube)):
            try:
                cubeNew[i].iloc[j] = ast.literal_eval(cube[i].iloc[j])[indicator] #parses string back to dict and takes the indicator
            except:
                continue
    return cubeNew

def timeseries(cube:pd.DataFrame,period:int)->pd.DataFrame:
    """
    creates time series vectors from the sliced covid data-cube
    
    Args
    :cube: sliced covid data-cube 
    :period: timeseries length
    
    Return
    :cube: covid data-cube with time-series vectors in each cell

    """     
    count = period 
    tempLst = []
    masterLst = []
    columnNames = []
    allLst = []
    for i in cube.columns: 
        for k in range(count,len(cube)):
            while count >= 0: 
                tempLst.append(cube[i][k-count])
                count = count-1
            masterLst.append(tempLst)
            columnNames.append(cube.index[k])
            count = period
            tempLst = []
        columnLabel = i 
        tempSr = pd.Series(masterLst,columnNames)
        tempDf = pd.DataFrame(data = tempSr,columns=[columnLabel])
        allLst.append(tempDf)
   
        masterLst = []
        columnNames = []
        master = pd.concat(allLst,axis=1)
    return master


def distfunc(target:list,comp:list,method:str)->int:
    """
    distance function lists all available similarity measures and returns the score between two vector
    
    Args
    :target: target vector to be compared with all other search space
    :comp: vector to compare with the target 
    :method: similarity measure 
    
    Return
    the distance value between two vectors for the given method

    """ 
    target = np.array(target)
    comp = np.array(comp)
    if method == 'euclidean': 
        return distance.euclidean(target,comp)
    if method == 'manhattan':
        return distance.cityblock(target,comp) 
    if method == 'chebyshev':
        return distance.chebyshev(target,comp)
    if method == 'dtw':
        return dtw(target,comp)
    if method == "lcs":
        return 1-lcss(target,comp)
    

def ranker(cube:pd.DataFrame,targetCountry:str,targetDate:datetime.date,method:str,topN:int)->list:
    """
    ranking function to return most similar timeseries given target country,date and method
    
    Args
    :cube: covid data-cube with time-series vectors in each cell
    :targetCountry: target country for the search
    :targetDate: target date for search
    :method: similarity measure
    :topN: number of countries to return
    
    Return
    :res: list of results in the format [countryName + ' ' + countryDate]
    
    """ 
    targetIdentifier = targetCountry + ' ' + datetime.datetime.strftime(targetDate,"%Y-%m-%d")
    identifier = []
    compValues = []
    result =[]
    distanceVal = []
    for i in cube.columns:
        for j in cube.index:
            if i != targetCountry:
                identifier.append(i + ' ' + datetime.datetime.strftime(j,"%Y-%m-%d"))
                compValues.append(distfunc(cube[targetCountry][targetDate],cube[i][j],method))

    for i in np.argsort(compValues).tolist():
        result.append(identifier[i]) 
        distanceVal.append(compValues[i])
    countSet = []
    res = []
    dis = []
    i = 0
    while len(res)<topN:
        if " ".join(result[i].split()[0:-1]) in countSet:
            i = i+1
            continue
        else:
            countSet.append(" ".join(result[i].split()[0:-1]))
            res.append(result[i])
            dis.append(distanceVal[i])
            i = i+1
    
    return res,dis

def normalizeTransparency(data):
    a = 0.3*(data - np.min(data)) / (np.max(data) - np.min(data))+0.3
    return a[::-1]



def firstRunOutput(cube:pd.DataFrame,targetCountry:str,firstDate:datetime.date,lastDate:datetime.date,indicator:str,method:str,numberOfResults:int,minPopulation:int,startDate:datetime.date,endDate:datetime.date,continentCheck:list)->dict:
    """
    function to read cube and user inputs and return ranked data streams including sub processes above
    Args
    :cube: covid data cube
    :targetCountry: target country for the search
    :firstDate: first date of the target data stream
    :lastDate: last date of the target data stream
    :indicator: covid data stream for the search (daily cases, biweekly deaths rate etc)
    :method: similarity measure
    :topN: number of countries to return
    :startDate: first date of the search space 
    :endDate: end date of the search space 
        
    Return
    
    :res: list of results in the format [countryName + ' ' + countryDate]
    
    """ 
    
    cubeFiltered = advancedfilters(cube,minPopulation,continentCheck,startDate,endDate)
    cubeSliced = slicer(cubeFiltered,indicator)
    cubeTimeSeries = timeseries(cubeSliced,(lastDate-firstDate).days)
    result = ranker(cubeTimeSeries,targetCountry,datetime.datetime(lastDate.year,lastDate.month,lastDate.day),method,numberOfResults)
    
    result[0].insert(0,targetCountry+" "+datetime.datetime.strftime(lastDate,"%Y-%m-%d"))
    result[1].insert(0,0)
    obj = []
    transparency = normalizeTransparency(result[1])
    for i in range(len(result[0])):
        country = " ".join(result[0][i].split()[0:-1])
        test = cubeSliced[country]
        vec = test.values
        date = test.index.date
        value = []
        for j in range(len(vec)):
            value.append({"date":date[j],"value":vec[j]})
            isQuery = True if country == targetCountry else False; 
            dictSample = {
                'key':country,
                'values':value, # update to values from 1/1/2021
                'isQuery': isQuery,
                'transparency': transparency[i],
                'matchedPeriodStart':(datetime.datetime.strptime(result[0][i].split()[-1],"%Y-%m-%d")-datetime.timedelta(days=(lastDate-firstDate).days)).date(),
                'matchedPeriodEnd':datetime.datetime.strptime(result[0][i].split()[-1],"%Y-%m-%d").date()
            }  
        obj.append(dictSample)
    return obj
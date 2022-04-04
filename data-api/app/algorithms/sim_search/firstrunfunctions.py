import datetime
import pandas as pd
import numpy as np
from scipy.spatial import distance
from tslearn.metrics import dtw,lcss
from app.core.settings import DATA_PATH_LIVE
import json
PATH_SEARCH = DATA_PATH_LIVE + "/owid"


def continentTransformer(continentCheck):
    temp  = []
    for i in continentCheck:
        if (continentCheck[i] == True):
            temp.append(i)
    return temp

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
    if method == "pearson":
        return distance.correlation(target,comp)
    if method == "cosine":
        return distance.cosine(target,comp)
    if method == "jensenshannon":  
        return distance.jensenshannon(target,comp)
    if method == "braycurtis":
        return distance.braycurtis(target,comp)

    

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



def firstRunOutput(targetCountry:str,firstDate:datetime.date,lastDate:datetime.date,indicator:str,method:str,numberOfResults:int,minPopulation:int,startDate:datetime.date,endDate:datetime.date,continentCheck:list)->dict:
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
    df_prot = pd.read_csv(PATH_SEARCH+"/"+indicator+".csv")
    df_prot.set_index("date",inplace=True)
    with open(PATH_SEARCH+'/populationLookUp.json') as pop:
        populationLookUp = json.load(pop)
    with open(PATH_SEARCH+'/continentLookUp.json') as cont:
        continentLookUp = json.load(cont)
    country_filter_lst = []

    for i in df_prot.columns:
        if populationLookUp[i]>minPopulation and continentLookUp[i] in continentCheck:
            country_filter_lst.append(i)
    cubeSliced = df_prot.filter(items=country_filter_lst)
    cubeSliced.index = pd.to_datetime(cubeSliced.index)
    cubeSliced = cubeSliced.loc[startDate:endDate]
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
                'values':value, 
                'isQuery': isQuery,
                'transparency': transparency[i],
                'matchedPeriodStart':(datetime.datetime.strptime(result[0][i].split()[-1],"%Y-%m-%d")-datetime.timedelta(days=(lastDate-firstDate).days)).date(),
                'matchedPeriodEnd':datetime.datetime.strptime(result[0][i].split()[-1],"%Y-%m-%d").date()
            }  
        obj.append(dictSample)
    return obj
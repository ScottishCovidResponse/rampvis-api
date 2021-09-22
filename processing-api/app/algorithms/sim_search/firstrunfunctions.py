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

def advancedfilters(cube,minPopulation,continentCheck,startDate,endDate):
    cube.fillna(0,inplace=True)
    dropped = []
    for i in range(1,len(cube.columns)):
        if(cube.iloc[-1][i] not in continentCheck or int(float(cube.iloc[-2][i])) <= minPopulation):
            dropped.append(cube.columns[i])
    cube.drop(columns=dropped,inplace=True)        
    cube.drop(cube.tail(2).index,inplace=True)
    cube.set_index(cube.columns[0],inplace=True)
    cube.index = pd.to_datetime(cube.index)
    cube = cube.loc[startDate:endDate]
    cube.index.names = ['Date']
    return cube

def slicer(cube,indicator):
    for i in cube.columns:
        for j in range(len(cube)):
            try:
                cube[i].iloc[j] = ast.literal_eval(cube[i].iloc[j])[indicator]
            except:
                continue
    return cube

def time_series(a,period):
    count = period - 1 
    temp_lst = []
    master_lst = []
    column_names = []
    all_lst = []
    for i in a.columns: 
        for k in range(count,len(a)):
            while count >= 0: 
                temp_lst.append(a[i][k-count])
                count = count-1
            master_lst.append(temp_lst)
            column_names.append(a.index[k])
            count = period-1
            temp_lst = []
        column_label = i 
        temp_sr = pd.Series(master_lst,column_names)
        temp_df = pd.DataFrame(data = temp_sr,columns=[column_label])
        all_lst.append(temp_df)
   
        master_lst = []
        column_names = []
        master = pd.concat(all_lst,axis=1)
    return master


def distfunc(target,comp,method):
    target = np.array(target)
    comp = np.array(comp)
    if method == 'euclidean': 
        return distance.euclidean(target,comp)
    if method == 'manhattan':
        return distance.manhattan(target,comp) 
    if method == 'chebyshev':
        return distance.chebyshev(target,comp)
    if method == 'dtw':
        return dtw(target,comp)
    if method == "lcs":
        return 1-lcss(target,comp)
    
def ranker(cube,target_country,target_date,method,top_n):
    target_identifier = target_country + ' ' + datetime.datetime.strftime(target_date,"%Y-%m-%d")
    identifier = []
    comp_values = []
    result =[]
    for i in cube.columns:
        for j in cube.index:
            if i != target_country:
                identifier.append(i + ' ' + datetime.datetime.strftime(j,"%Y-%m-%d"))
                comp_values.append(distfunc(cube[target_country][target_date],cube[i][j],method))

    for i in np.argsort(comp_values)[:top_n].tolist():
        result.append(identifier[i])
    
    return result

def firstRunOutput(cube,targetCountry,firstDate,lastDate,indicator,method,numberOfResults,minPopulation,startDate,endDate,continentCheck):
    cube_filtered = advancedfilters(cube,minPopulation,continentCheck,startDate,endDate)
    sliced = slicer(cube_filtered,indicator)
    sliced = time_series(sliced,(lastDate-firstDate).days)
    result = ranker(sliced,targetCountry,datetime.datetime(lastDate.year,lastDate.month,lastDate.day),method,numberOfResults)
    master_dict = dict()
    for i in result:
        vec = sliced[" ".join(i.split()[0:-1])][i.split()[-1]]
        date = pd.date_range(end=i.split()[-1],start=datetime.datetime.strptime(i.split()[-1],"%Y-%m-%d") - datetime.timedelta(days=(lastDate-firstDate).days-1))
        dict_sample = dict(zip(date,vec))
        master_dict[i]=dict_sample
    return master_dict

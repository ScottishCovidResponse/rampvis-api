from datetime import datetime,timedelta
import pandas as pd
import numpy as np
from app.core.settings import DATA_PATH_LIVE
from sandu.uncertainty_quantification import mean_time_series

PATH_SEARCH = DATA_PATH_LIVE + "/owid"

def lowercase(n):
    return n.lower()

def seriesFormat(series,key):
    length = len(series)
    new_index = np.arange(0,length)
    series.index = new_index
    iterator = series.name
    df = series.to_frame()
    df["iter"] = iterator
    df.set_index("iter",inplace=True)
    df["day"] = new_index
    df.rename(columns={iterator:key},inplace=True)
    return df

def parsePredictList(prot):
    js =[]
    count = 0
    obj_master = {}
    for i in prot: #pick date index for each
        for j in range(len(i.split(" "))):
            try:
                datetime.strptime(i.split(" ")[j],"%Y-%m-%d")
                js.append(j)
            except:
                continue

    for i in prot:
        country = " ".join(i.split(" ")[0:js[count]])
        date = i.split(" ")[js[count]]
        stream = " ".join(i.split(" ")[js[count]+1:])
        if stream in obj_master:
            obj_master[stream]["country"].append(country)
            obj_master[stream]["date"].append(date)
            count += 1
        else:
            obj_master[stream] = {"country":[country],"date":[date]}
            count += 1
        
        
    return obj_master    


def callTimeSeries(grouped_obj,query_form):
    time_series = {"series":{},"meancurves":{},"query":{}}
    for key in grouped_obj:
        file = "_".join(list(map(lowercase,key.split(" "))))
        df = pd.read_csv(PATH_SEARCH+"/{}.csv".format(file),parse_dates=[0],index_col=0)
        df = df.filter(items= grouped_obj[key]["country"])
        count = 0
        df_trans = pd.DataFrame()
        time_series["series"][key] = {}
        for countries in df.columns:
            date = grouped_obj[key]["date"][count]
            series = df[countries].loc[date:]
            name = df[countries].loc[date:].name
            df_series = seriesFormat(series,key)
            df_trans = pd.concat([df_trans,df_series])
            time_series["series"][key][name] = series.to_frame()
            count += 1
        df_query = pd.read_csv(PATH_SEARCH+"/{}.csv".format(file),parse_dates=[0],index_col=0)
        df_query = df_query.filter(items= [query_form["country"]]) 
        df_query = df_query.loc[query_form["first_date"]:query_form["last_date"]]
        time_series["query"][key] = df_query.to_dict()[query_form["country"]]
        time_series["meancurves"][key] = mean_time_series.get_mean(df_trans, "day", key)
         
    return time_series

def objectToUI(time_series,query_form):
    for key in time_series["meancurves"]:  
        mean_length = len(time_series["meancurves"][key].index)
        last_date = datetime.strptime(query_form["last_date"],"%Y-%m-%d")
        day_delta = timedelta(days=1)
        beg_predict = last_date + day_delta
        predict_lst = beg_predict + np.arange(mean_length) * day_delta
        time_series["meancurves"][key].set_index(predict_lst,inplace=True)
        time_series["meancurves"][key].drop("day",axis=1,inplace=True)
        time_series["meancurves"][key] = time_series["meancurves"][key].to_dict()[key]
        

        for countries in time_series["series"][key]:
            series_length = len(time_series["series"][key][countries])
            series_predict_list = beg_predict + np.arange(series_length)*day_delta
            time_series["series"][key][countries].set_index(series_predict_list,inplace=True)
            time_series["series"][key][countries] =  time_series["series"][key][countries].to_dict()[countries]
    return time_series

def predictOutput(predict_input):
    prot = predict_input.series
    query_form = predict_input.query
    grouped_obj = parsePredictList(prot)
    time_series = callTimeSeries(grouped_obj,query_form)
    output =  objectToUI(time_series,query_form) 
    return output
import pandas as pd
from app.core.settings import DATA_PATH_LIVE
import datetime
import json

def to_cube(df:pd.DataFrame):
    PATH_SEARCH = DATA_PATH_LIVE + "/owid"
    continents = ["Asia","Africa",'Europe','North America','South America','Oceania'] 
    df = df[df.continent.isin(continents)] # get only country objects 
    df = df[df.date> datetime.datetime.strptime("2021-01-01","%Y-%m-%d")] # data from 1st of January 2021

    raw_streams = ["new_cases","new_deaths","new_cases_per_million","new_deaths_per_million"] 

    # Creating Data Streams for Time Series Search and Save #

    for streams in raw_streams:
        df_filtered = df.filter(items=[streams,"continent","location","date","population"])
        country_lst = df_filtered.location.unique()
        df_grouped = df_filtered.groupby(by=["location"])
        df_count_lst = []

        for country in country_lst:
            df_count_prot = df_grouped.get_group(country)
            indicator = df_count_prot[streams]
            dates = df_count_prot.date
            df_count = pd.DataFrame(data=indicator.values,index=dates,columns=[country])
            df_count_lst.append(df_count)
            

        df_stream = pd.concat(df_count_lst,axis=1)
        df_stream = df_stream.rolling(14).mean() # 14-day moving average filter
        df_stream.fillna(0,inplace=True)
        df_stream.to_csv(PATH_SEARCH +"/{}.csv".format(streams))
        
        idd = "_".join(streams.split("_")[1:]) # get rids of "new" 
        
        df_stream_weekly = df_stream.rolling(7).sum()
        df_stream_weekly.fillna(0,inplace=True)
        df_stream_weekly.to_csv(PATH_SEARCH +"/{}.csv".format("_".join(["weekly",idd])))
        
        
        df_stream_biweekly = df_stream.rolling(14).sum()
        df_stream_biweekly.fillna(0,inplace=True)
        df_stream_biweekly.to_csv(PATH_SEARCH +"/{}.csv".format("_".join(["biweekly",idd])))

    # Create Population and Continent LookUp Tables
    populationLookUp = {}
    continentLookUp = {}

    df_no_dup = df.drop_duplicates(subset=["location"])
    for i in range(len(df_no_dup)):
        populationLookUp[df_no_dup["location"].iloc[i]] = df_no_dup["population"].iloc[i]
        continentLookUp[df_no_dup["location"].iloc[i]] = df_no_dup["continent"].iloc[i]

    with open(PATH_SEARCH+'/populationLookUp.json', 'w') as pop:
        json.dump(populationLookUp, pop)
    with open(PATH_SEARCH+'/continentLookUp.json', 'w') as cont:
        json.dump(continentLookUp, cont)


    # get all quantitative variables from OWID data for qualitative comparison 
    df_categorical_variables = df_no_dup.filter(items=["continent","location"]+df_no_dup.columns[df_no_dup.columns.get_loc("stringency_index"):].tolist())

    df_categorical_variables.to_csv(PATH_SEARCH+"/categorical_variables.csv")

    other_streams = ["icu_patients_per_million","weekly_icu_admissions_per_million","people_vaccinated_per_hundred"]

    for streams in other_streams:
        df_filtered = df.filter(items=[streams,"continent","location","date","population"])
        country_lst = df_filtered.location.unique()
        df_grouped = df_filtered.groupby(by=["location"])
        df_count_lst = []

        for country in country_lst:
            df_count_prot = df_grouped.get_group(country)
            indicator = df_count_prot[streams]
            dates = df_count_prot.date
            df_count = pd.DataFrame(data=indicator.values,index=dates,columns=[country])
            df_count_lst.append(df_count)
        df_stream = pd.concat(df_count_lst,axis=1)
        df_stream.to_csv(PATH_SEARCH +"/{}.csv".format(streams))


        
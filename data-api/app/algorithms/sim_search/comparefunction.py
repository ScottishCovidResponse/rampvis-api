import pandas as pd
from app.core.settings import DATA_PATH_LIVE
PATH_SEARCH = DATA_PATH_LIVE + "/owid"
streams_to_show = ["biweekly_cases_per_million","biweekly_deaths_per_million","icu_patients_per_million","people_vaccinated_per_hundred","stringency_index"];

def compareOutput(benchmarkCountries):
    obj_lst = []
    for streams in streams_to_show:
        df_prot = pd.read_csv(PATH_SEARCH+"/{}.csv".format(streams))
        df_prot.set_index("date",inplace=True)

        obj = {}
        obj["key"] = streams
        df_filt = df_prot.filter(items=benchmarkCountries).tail(120)
    
        for i in df_filt.columns:
            if df_filt[i].isnull().all() == True:
                df_filt.drop(i,axis = 1,inplace=True)
        df_filt.fillna(0,inplace=True)
        obj["value"] = df_filt.to_dict()
        obj_lst.append(obj)
    obj_cat  = {}
    
    
    df_cat  = pd.read_csv(PATH_SEARCH+"/categorical_variables.csv")
    df_cat_filt = df_cat.loc[df_cat['location'].isin(benchmarkCountries)]
    for i in df_cat_filt.columns:
        if df_cat_filt[i].isnull().all() == True:
            df_cat_filt.drop(i,axis = 1,inplace=True)
    df_cat_filt.fillna(0,inplace=True)
    obj_cat["key"] = "categorical_variables"
    inner_obj = {}
    for i in range(len(df_cat_filt)):
        inner_obj[df_cat_filt.iloc[i]["location"]] = df_cat_filt.iloc[0].filter(items=df_cat_filt.columns[df_cat_filt.columns.get_loc("population"):]).to_dict()
    obj_cat["values"] = inner_obj
    obj_lst.append(obj_cat)
    return obj_lst
    
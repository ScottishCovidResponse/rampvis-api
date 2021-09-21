import pandas as pd
import datetime
import numpy as np
# data transformations functions
def country_filter(country_name,df):    # group by country name
    count_index = df.groupby('location').groups[country_name].values
    country_data = df.loc[count_index].copy(deep = True)
    country_data.set_index('date',inplace = True)
    country_data.drop(['iso_code','population','continent','population_density'],axis=1,inplace=True)
    
    # adding derived data streams for each country
    country_data["weekly_cases"] = country_data["new_cases"].rolling(7).sum()
    country_data["biweekly_cases"] = country_data["new_cases"].rolling(14).sum()
    country_data["weekly_cases_per_million"] = country_data["new_cases_per_million"].rolling(7).sum()
    country_data["biweekly_cases_per_million"] = country_data["new_cases_per_million"].rolling(14).sum()
    country_data["weekly_cases_rate"] = country_data["weekly_cases"].diff(periods=7) / country_data["weekly_cases"] * 100
    country_data["biweekly_cases_rate"] = country_data["biweekly_cases"].diff(periods=14) / country_data["biweekly_cases"] * 100
    
    country_data["weekly_deaths"] = country_data["new_deaths"].rolling(7).sum()
    country_data["biweekly_deaths"] = country_data["new_deaths"].rolling(14).sum()
    country_data["weekly_deaths_per_million"] = country_data["new_deaths_per_million"].rolling(7).sum()
    country_data["biweekly_deaths_per_million"] = country_data["new_deaths_per_million"].rolling(14).sum()
    country_data["weekly_deaths_rate"] = country_data["weekly_deaths"].diff(periods=7) / country_data["weekly_deaths"] * 100
    country_data["biweekly_deaths_rate"] = country_data["biweekly_deaths"].diff(periods=14) / country_data["biweekly_deaths"] * 100
    country_data.fillna(0,inplace=True)
    country_data.replace([np.inf,-np.inf],0,inplace=True)
    return country_data  

def cube_sample(country,df): # change OWID structure from cube for a single country
    test_df = country_filter(country,df)
    country_name = test_df['location'][0]
    test_df.drop(['location'],axis=1,inplace=True)
    test_df = test_df[test_df.index > datetime.datetime.strptime("2021-01-01","%Y-%m-%d")]
    master_lst = [] 
    temp_dict = {}

    for j in range(len(test_df.index)):
        for i in range(len(test_df.columns)):
            temp_dict[test_df.columns[i]] = test_df.iloc[j][i]
        master_lst.append(temp_dict)
        temp_dict = {}
    test = {country_name : master_lst}
    sample_df = pd.DataFrame(index=test_df.index,data=test)
    return sample_df

def cube_master(df): # concatanate all transformed countries
    country_list = df['location'].unique()
    df_lst = []
    for country in country_list:
        
        df_lst.append(cube_sample(country,df))
        
    return pd.concat(df_lst,axis=1)
import pandas as pd
import numpy as np

from sandu.data_types import UncertaintyInput
from sandu.uncertainty_quantification import mean_time_series

def get_subset(df_in,run_name, desired_samples):
    all_runs = df_in[run_name].unique()
    n_samples = desired_samples if len(all_runs) > desired_samples else len(all_runs)
    kept_runs = np.random.choice(all_runs, n_samples, replace=False)
    df_out = df_in[df_in[run_name].isin(kept_runs)]
    return df_out

def mean_all(x_in: UncertaintyInput):
    df_mean = mean_time_series.get_mean(x_in.df(), x_in.time_name, x_in.quantity_name)
    df_all = get_subset(x_in.df(), x_in.run_name, 100)
    data_dict = {"dataAll": df_all.to_dict(orient="records"),
                 "dataMean": df_mean.to_dict(orient="records"),
                 "runName": x_in.run_name,  # Name of column denoting the different runs
                 "timeName": x_in.time_name,  # Name of column with the time unit
                 "quantityName": x_in.quantity_name # Name of column with the quantity of interest
                 }
    return data_dict
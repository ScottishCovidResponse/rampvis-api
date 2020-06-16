import pandas as pd
import scipy.stats as stats


def mse(df: pd.DataFrame):
    result = []
    for i in df.columns:
        obj = {'name': i}

        for j in df.columns:
            mse_val = ((df[i] - df[j]) ** 2).mean() ** .5
            obj[j] = round(mse_val, 2)

        result.append(obj)

    return result


def f_test(df: pd.DataFrame):
    result = []
    for i in df.columns:
        obj = {'name': i}

        for j in df.columns:
            f_val = stats.f_oneway(df[i], df[j])[0]
            obj[j] = round(f_val, 2)

        result.append(obj)

    return result


def pearson_correlation(df: pd.DataFrame):
    result = []
    for i in df.columns:
        obj = {'name': i}

        for j in df.columns:
            corr_coeff = stats.pearsonr(df[i], df[j])[0]
            obj[j] = round(corr_coeff, 2)

        result.append(obj)

    return result

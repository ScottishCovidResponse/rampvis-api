import pandas as pd
import scipy.stats as stats


def mse(df: pd.DataFrame):
    result = []
    max_val = 0

    #
    # TODO improve!
    #
    for i in df.columns:
        for j in df.columns:
            mse_val = ((df[i] - df[j]) ** 2).mean() ** .5
            if mse_val > max_val:
                max_val = mse_val

    for i in df.columns:
        obj = {'name': i}
        for j in df.columns:
            mse_val = ((df[i] - df[j]) ** 2).mean() ** .5
            obj[j] = round(max_val - mse_val, 2)

        result.append(obj)

    print(result)

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

# From https://github.com/ScottishCovidResponse/scrc-vis-analytical/blob/master/CorrelationMetrics/utils.py
# Updated on 23.06.2020

import json
import pandas as pd
import numpy as np
import scipy
from scipy import stats as stats
from scipy import signal as signal
from skimage import metrics as ski_metrics
from sklearn import metrics as skl_metrics

def compute_metrics(df1, df2, metrics, window):
    number_of_columns1 = len(df1.columns)
    number_of_columns2 = len(df2.columns)

    # { var1_names, var2_names, metric1: 2d array, metric2: ... }}
    result = { 
        'var1_names': df1.columns[1:].tolist(),
        'var2_names': df2.columns[1:].tolist()
    }
    for m in metrics:
        result[m] = np.zeros((number_of_columns1 - 1, number_of_columns2 - 1))

    # Using nested for loops to create a 2-D matrix
    for i in range(number_of_columns1 - 1):
        for j in range(number_of_columns2 - 1):
            X = df1.columns[i + 1]
            Y = df2.columns[j + 1]

            # Remove missing data if needed
            seriesX = removeMissingData(df1[X])
            seriesY = removeMissingData(df2[Y])

            # Smooth the data if needed
            if window != 'none':
                seriesX = smooth(x=seriesX,window_len=5, window=window)
                seriesY = smooth(x=seriesY,window_len=5, window=window)

            if seriesX.shape != seriesY.shape:
                raise ValueError('Only accepts signals that have the same shape.')

            # Compute the similarity metrics
            if 'zncc' in metrics: result['zncc'][i][j] = getZNCC(seriesX, seriesY)
            if 'ssim' in metrics: result['ssim'][i][j] = ski_metrics.structural_similarity(seriesX, seriesY)
            if 'psnr' in metrics: result['psnr'][i][j] = getPSNR(seriesX, seriesY)
            
            # Note: added by Phong
            if 'f-test' in metrics: result['f-test'][i][j] = stats.f_oneway(seriesX, seriesY)[0]
            
            # Use pandas corr to ingnore inf and nan.
            seriesX, seriesY = pd.Series(seriesX), pd.Series(seriesY)

            if 'pearsonr' in metrics: result['pearsonr'][i][j] = seriesX.corr(seriesY, method='pearson')
            if 'spearmanr' in metrics: result['spearmanr'][i][j] = seriesX.corr(seriesY, method='spearman')
            if 'kendalltau' in metrics: result['kendalltau'][i][j] = seriesX.corr(seriesY, method='kendall')

            # Compute dissimilarity metrics
            if 'mse' in metrics: result['mse'][i][j] = ski_metrics.mean_squared_error(seriesX, seriesY)
            if 'nrmse' in metrics: result['nrmse'][i][j] = ski_metrics.normalized_root_mse(seriesX, seriesY)
            if 'me' in metrics: result['me'][i][j] = getME(seriesX, seriesY)
            if 'mae' in metrics: result['mae'][i][j] = getMAE(seriesX, seriesY)
            if 'msle' in metrics: result['msle'][i][j] = getMSLE(seriesX, seriesY)
            if 'medae' in metrics: result['medae'][i][j] = getMedAE(seriesX, seriesY)
    
    return result

def variable_to_df(var):
    filepath = os.path.join(current_app.root_path, CSV_DATA_PATH, var + '.csv')
    return pd.read_csv(filepath)
    
def getZeroMeanNormalised(series: np.array) -> np.array:
    """ Zero-mean and unit-variance normalisation.
    Return the normalised 1-D signal."""
    return (series - np.mean(series)) / np.std(series)


def removeComma(intAsStr: str) -> int:
    """ Remove the comma from an int stored as a string.
    Return the corresponding int."""

    return int(intAsStr.replace(',', ''))


def removeMissingData(series) -> np.array:
    """Remove samples that are equal to '*' and make sure the commas have been removed from numbers.
    Returns the two time series without the missing data.
    """

    temp = []

    for i in series:
        if i == '*':
            temp.append(0)
        elif isinstance(i, str):
            temp.append(removeComma(i))
        elif np.isnan(i) == True:
            temp.append(0)
        elif np.isinf(i) == True:
            temp.append(0)
        else:
            temp.append(i)

    return np.array(temp)


def getZNCC(series1, series2) -> float:
    """ Returns the zero-mean normalised cross-correlation ('ZNCC') between two signals."""

    if series1.shape != series2.shape:
        raise ValueError("getZNCC only accepts signals that have the same shape.")

    temp1 = removeMissingData(series1)
    temp2 = removeMissingData(series2)

    return np.mean(np.multiply(getZeroMeanNormalised(temp1), getZeroMeanNormalised(temp2)))


# From https://scipy-cookbook.readthedocs.io/items/SignalSmooth.html
def smooth(x,window_len=11,window='hanning') -> np.array:
    """smooth the data using a window with requested size.
    This method is based on the convolution of a scaled window with the signal.
    The signal is prepared by introducing reflected copies of the signal
    (with the window size) in both ends so that transient parts are minimized
    in the begining and end part of the output signal.
    input:
        x: the input signal
        window_len: the dimension of the smoothing window should be an odd integer
        window: the type of window from 'flat', 'hanning', 'hamming', 'bartlett', 'blackman'
            flat window will produce a moving average smoothing.
    output:
        the smoothed signal
    example:
    t=linspace(-2,2,0.1)
    x=sin(t)+randn(len(t))*0.1
    y=smooth(x)
    see also:
    numpy.hanning, numpy.hamming, numpy.bartlett, numpy.blackman, numpy.convolve
    scipy.signal.lfilter
    TODO: the window parameter could be the window itself if an array instead of a string
    NOTE: length(output) != length(input), to correct this: return y[(window_len/2-1):-(window_len/2)] instead of just y.
    """

    # print(x.ndim, x.size, window_len)

    if x.ndim != 1:
        raise ValueError("smooth only accepts 1 dimension arrays.")

    if x.size < window_len:
        return x
        raise ValueError("Input vector needs to be bigger than window size.")


    if window_len<3:
        return x


    if not window in ['flat', 'hanning', 'hamming', 'bartlett', 'blackman']:
        raise ValueError("Window is on of 'flat', 'hanning', 'hamming', 'bartlett', 'blackman'")


    s=np.r_[x[window_len-1:0:-1],x,x[-2:-window_len-1:-1]]
    #print(len(s))
    if window == 'flat': #moving average
        w=np.ones(window_len,'d')
    else:
        w=eval('np.'+window+'(window_len)')

    y=np.convolve(w/w.sum(),s,mode='valid')
    return y

def getPSNR(series1, series2) -> float:
    """Return 0 if mean squared error between two series is 0.
    PSNR cannot be computed if mean squared error between two series is 0."""

    temp1 = removeMissingData(series1)
    temp2 = removeMissingData(series2)

    data_range = max(max(series1),max(series2))

    if ski_metrics.mean_squared_error(temp1, temp2) == 0.:
        return 0.

    return ski_metrics.peak_signal_noise_ratio(temp1, temp2, data_range=data_range)

def getME(series1, series2) -> float:
    """Returns Max Error (ME) between two signals. Returns 0 if contains NaN or Inf."""

    temp1 = removeMissingData(series1)
    temp2 = removeMissingData(series2)

    return skl_metrics.max_error(temp1, temp2)

def getMAE(series1, series2) -> float:
    """Returns Mean Absolute Error (MAE) between two signals. Returns 0 if contains NaN or Inf."""

    temp1 = removeMissingData(series1)
    temp2 = removeMissingData(series2)

    return skl_metrics.mean_absolute_error(temp1, temp2)

def getMSLE(series1, series2) -> float:
    """Returns Mean Squared Log Error (MSLE) between two signals. Returns 0 if contains NaN or Inf."""

    temp1 = removeMissingData(series1)
    temp2 = removeMissingData(series2)

    return skl_metrics.mean_squared_log_error(temp1, temp2)

def getMedAE(series1, series2) -> float:
    """Returns Median Absolute Error (MedAE) between two signals. Returns 0 if contains NaN or Inf."""

    temp1 = removeMissingData(series1)
    temp2 = removeMissingData(series2)

    return skl_metrics.median_absolute_error(temp1, temp2)
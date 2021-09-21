# From https://github.com/ScottishCovidResponse/scrc-vis-analytical/blob/master/CorrelationMetrics/utils.py
# Updated on 23.06.2020

from time import time
import pandas as pd
import numpy as np
from scipy import stats as stats
from skimage import metrics as ski_metrics
from sklearn import metrics as skl_metrics

def compute_metrics(seriesX, seriesY, metric, window):
    # Smooth the data if needed
    if window != 'none':
        seriesX = smooth(x=seriesX, window_len=5, window=window)
        seriesY = smooth(x=seriesY, window_len=5, window=window)

    if seriesX.shape != seriesY.shape:
        raise ValueError('Only accepts signals that have the same shape.')

    # Compute the similarity metrics
    if metric == 'zncc': return getZNCC(seriesX, seriesY)
    if metric == 'ssim': return ski_metrics.structural_similarity(seriesX, seriesY)
    if metric == 'psnr': return getPSNR(seriesX, seriesY)
    if metric == 'f-test': return stats.f_oneway(seriesX, seriesY)[0]

    seriesX, seriesY = pd.Series(seriesX), pd.Series(seriesY)

    if metric == 'pearsonr': return seriesX.corr(seriesY, method='pearson')
    if metric == 'spearmanr': return seriesX.corr(seriesY, method='spearman')
    if metric == 'kendalltau': return seriesX.corr(seriesY, method='kendall')

    # Compute dissimilarity metrics
    if metric == 'mse': return ski_metrics.mean_squared_error(seriesX, seriesY)
    if metric == 'nrmse': return ski_metrics.normalized_root_mse(seriesX, seriesY)
    if metric == 'me': return getME(seriesX, seriesY)
    if metric == 'mae': return getMAE(seriesX, seriesY)
    if metric == 'msle': return getMSLE(seriesX, seriesY)
    if metric == 'medae': return getMedAE(seriesX, seriesY)
    
def getZeroMeanNormalised(series: np.array) -> np.array:
    """ Zero-mean and unit-variance normalisation.
    Return the normalised 1-D signal."""
    return (series - np.mean(series)) / np.std(series)


def getZNCC(series1, series2) -> float:
    """ Returns the zero-mean normalised cross-correlation ('ZNCC') between two signals."""

    return np.mean(np.multiply(getZeroMeanNormalised(series1), getZeroMeanNormalised(series2)))


# From https://scipy-cookbook.readthedocs.io/items/SignalSmooth.html
def smooth(x, window_len=11, window='hanning') -> np.array:
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

    if window_len < 3:
        return x

    if not window in ['flat', 'hanning', 'hamming', 'bartlett', 'blackman']:
        raise ValueError("Window is on of 'flat', 'hanning', 'hamming', 'bartlett', 'blackman'")

    s = np.r_[x[window_len - 1:0:-1], x, x[-2:-window_len - 1:-1]]
    # print(len(s))
    if window == 'flat':  # moving average
        w = np.ones(window_len, 'd')
    else:
        w = eval('np.' + window + '(window_len)')

    y = np.convolve(w / w.sum(), s, mode='valid')
    return y


def getPSNR(series1, series2) -> float:
    """Return 0 if mean squared error between two series is 0.
    PSNR cannot be computed if mean squared error between two series is 0."""

    data_range = max(max(series1), max(series2))

    if ski_metrics.mean_squared_error(series1, series2) == 0.:
        return 0.

    return ski_metrics.peak_signal_noise_ratio(series1, series2, data_range=data_range)


def getME(series1, series2) -> float:
    """Returns Max Error (ME) between two signals. Returns 0 if contains NaN or Inf."""

    return skl_metrics.max_error(series1, series2)


def getMAE(series1, series2) -> float:
    """Returns Mean Absolute Error (MAE) between two signals. Returns 0 if contains NaN or Inf."""

    return skl_metrics.mean_absolute_error(series1, series2)


def getMSLE(series1, series2) -> float:
    """Returns Mean Squared Log Error (MSLE) between two signals. Returns 0 if contains NaN or Inf."""

    return skl_metrics.mean_squared_log_error(series1, series2)


def getMedAE(series1, series2) -> float:
    """Returns Median Absolute Error (MedAE) between two signals. Returns 0 if contains NaN or Inf."""

    return skl_metrics.median_absolute_error(series1, series2)

def main():
    metrics = ['zncc', 'ssim', 'psnr', 'f-test', 'pearsonr', 'spearmanr', 'kendalltau', 'mse', 'nrmse', 'me', 'mae', 'msle', 'medae']
    windows = ['none', 'flat', 'hanning', 'hamming', 'bartlett', 'blackman']

    x = np.random.randint(0, 1000, 100)
    y = np.random.randint(0, 1000, 100)

    print('Making 10,000 comparisons of two 100-length variables with PearsonR and Hanning smoothing')
    tik = time()
    for _ in range(5):
        for _ in range(10000):
            compute_metrics(x, y , 'pearsonsr', 'hanning')
    tok = time()
    print(f'Average of 5 runs : {(tok - tik) / 5:.1f} seconds')

    print('Making 100 comparisons of two 100-length variables with 13 metrics x 6 smoothing windows')
    tik = time()
    for _ in range(5):
        for _ in range(100):
            for m in metrics:
                for w in windows:
                    compute_metrics(x, y , m, w)
    tok = time()
    print(f'Average of 5 runs : {(tok - tik) / 5:.1f} seconds')
    
if __name__ == '__main__':
    main()
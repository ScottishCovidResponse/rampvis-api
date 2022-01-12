import app.controllers.agents.uncertainty_analysis.uncertainty_mean_sample as ums
import app.controllers.agents.uncertainty_analysis.clustering_tools as ct
from sandu.data_types import SensitivityInput


def mean_and_sample(x_in: SensitivityInput):
    """ Computes the mean time series and draws a random sample. Uses uncertainty_mean_sample.
    
    Args:
        x_in: SensitivityInput object containing time series.
    """
    uncertainty_object = ct.sensitivity_to_uncertainty_object(x_in)
    data_dict = ums.mean_and_sample(uncertainty_object)
    return data_dict

import app.controllers.agents.uncertainty_analysis.clustering_tools as ct
from sandu.data_types import SensitivityInput


def max_value(x: SensitivityInput):
    """ Finds the largest value of the quantity_mean in a SensitivityInput object.
    
    Args:
        x: SensitivityInput object.
    """
    df_in = x.df()
    if df_in[x.quantity_mean].map(type).eq(list).all():
        df_temp = df_in[x.quantity_mean].apply(max)
    largest = df_temp.max()
    return largest


def max_in_clusters(raw_cluster_data: str):
    """ Finds the largest value in clustered raw data. Used to determine y axis in plots.
    
    Args:
        raw_cluster_data: JSON string which must contain:
            k: number of clusters.
            clusters: a list with the SensitivityInput object for each cluster in a JSON format.
    """
    largest_in_each_cluster = ct.sens_function_on_clusters(raw_cluster_data, max_value)
    return max(largest_in_each_cluster)

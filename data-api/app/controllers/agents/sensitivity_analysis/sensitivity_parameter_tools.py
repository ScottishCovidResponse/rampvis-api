def sensitivity_parameter_ranges(x_in):
    """Computes the ranges of values for each parameter in a SensitivityInput object. Returns quantities for plotting.
    
    Args:
        x_in: SensitivityInput object.
        
    Returns:
        data_list: A list with one entry for each non-constant parameter. Entries are dictionaries with quantities for plotting.
    """
    data_list = []
    df = x_in.df()
    parameters = [x_in.parameters[i] for i in range(len(x_in.parameters)) if len(x_in.bounds[i]) > 1]
    bounds = [x_in.bounds[i] for i in range(len(x_in.parameters)) if len(x_in.bounds[i]) > 1]
    nr_of_parameters = len(parameters)
    param_range = [bounds[i][1] - bounds[i][0] for i in range(nr_of_parameters)]
    param_values = [df[i] for i in parameters]
    param_values = [(param_values[i] - bounds[i][0]) / param_range[i] for i in range(nr_of_parameters)]
    for i in range(nr_of_parameters):
        parameter = parameters[i]
        lower_bound = bounds[i][0]
        upper_bound = bounds[i][1]
        normalisation = upper_bound - lower_bound
        lower_range = df[parameter].min()
        upper_range = df[parameter].max()
        tick_marks = param_values[i].tolist()
        dict = {"name": parameter,
                "boundMax": lower_bound,
                "boundMin": upper_bound,
                "range:": upper_range - lower_range,
                "rescaledRange": (upper_range - lower_range) / normalisation,
                "rescaledStart": (lower_range - lower_bound) / normalisation,
                "rescaledTicks": tick_marks
                }
        data_list.append(dict)
    return data_list

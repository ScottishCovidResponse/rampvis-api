import numpy as np
from sandu import gaussian_process_emulator as gpe
from sandu.sensitivity_analysis.sobol import saltelli_with_constant_bounds
from typing import Tuple, Callable
import pandas as pd
import app.controllers.agents.sensitivity_analysis.interaction_tools as it
from scipy.signal import savgol_filter


def parameter_variation(df_in: pd.DataFrame, parameters_in: list, bounds_in: list, quantity_mean_in: str,
                        quantity_variance_in: str, N_in: int, n_steps: int,
                        scalar_mean_function: Callable[[list], float] = sum,
                        scalar_variance_function: Callable[[list], float] = sum, interactions_in = []) -> Tuple[list, list, list]:
    """ Returns quantities required for plotting how varying a parameter affects a scalar feature of the output.
        This involves showing the (1) raw data, (2) emulated data for a representative sample of other parameters.

    Args:
        df_in: Dataframe with input parameters and the mean and variance of the output quantity.
        parameters_in: Names of the columns with model parameters in df_in.
        bounds_in: Bounds of model parameters as [[param1_lower_bound,param1_upper_bound],[...],[param_x_fixed],..].
            For parameters with a fixed value this is the fixed value.
        quantity_mean_in: name of the column with the mean of the model output to be analysed.
        quantity_variance_in: name of the column with the variance of the model output to be analysed.
        N_in: N used to determine number of parameter samples in Saltelli sampling.  Note: Must be power of 2.
        n_steps:
        scalar_mean_function: Function mapping list objects in the mean column of df_in to scalars.
        scalar_variance_function: Function mapping list objects in the variance column of df_in to scalars.

    Returns:
        parameters_var: List containing names of parameters which are not constant.
        datapoints_x_var: List containing list of parameter values present in the dataset, for every parameter.
        datapoints_y_var: List containing list of output values present in the dataset, ordered as datapoints_x_var.
        steps_var: List containing the steps/x-coordinates associated with the output curves (y_vars/y_mean_var).
        y_var: List containing the y-values for ensemble of curves from emulator for each parameter in parameters_var.
        y_mean_var: List containing mean y-values, thus mean curve, from all predictions in y_var.
    """

    problem_all = {'num_vars': len(parameters_in),
                   'names': parameters_in,
                   'bounds': bounds_in}

    X, problem_reduced = saltelli_with_constant_bounds(problem_all, N_in)
    n_samples = np.shape(X)[0]

    datapoints_x_var = []
    datapoints_y_var = []
    steps_var = []
    y_var = []
    y_mean_var = []
    parameters_var = [parameters_in[i] for i in range(len(parameters_in)) if len(bounds_in[i]) > 1]
    bounds_var = [bounds_in[i] for i in range(len(parameters_in)) if len(bounds_in[i]) > 1]

    df_s = gpe.get_scalar_features(df_in, quantity_mean_in, quantity_variance_in, scalar_mean_function,
                                   scalar_variance_function)

    X_tr_temp, y_tr_temp, alpha_tr_temp = gpe.form_training_set(df_s, parameters_in, quantity_mean_in, quantity_variance_in)
    temp_model, temp_scaler = gpe.train_GP_emulator(X_tr_temp, y_tr_temp, alpha_tr_temp)

    for i, param in enumerate(parameters_var):
        # Get the index of the parameter in the list which can contain constant parameters
        param_index = parameters_in.index(param)

        steps = np.linspace(bounds_in[param_index][0], bounds_in[param_index][1], n_steps)
        # Add the list of parameter values used as steps for the parameter
        steps_var.append(steps)

        # Repeat Saltelli sampling
        X_new = np.repeat(X, n_steps, axis=0)
        repeated = np.tile(steps, n_samples)

        # Inserts incremental values of parameter in question along constant Saltelli sampled values of other parameters
        X_new[:, param_index] = repeated

        # Form list with points
        points_x = df_in[param].tolist()
        points_y = df_in[quantity_mean_in].tolist()
        datapoints_x_var.append(points_x)
        datapoints_y_var.append(points_y)

        y = gpe.predict_GP_emulator(X_new, temp_model, temp_scaler)
        Y = np.reshape(y, (n_samples, n_steps))
        y_var.append(Y.tolist())

        mean = np.mean(Y, axis=0)
        y_mean_var.append(mean)

    # Now deal with user specified interactions
    df_temp, _ ,_ = it.custom_inputs(df_in, parameters_in, bounds_in, interactions_in)
    df_padded, parameters_padded, bounds_padded = it.custom_inputs_gpe(temp_model, temp_scaler, problem_all, parameters_in, quantity_mean_in,
                                                                                 bounds_in, N_in, 2, interactions_in)
    param_length = len(parameters_in)
    n_interactions = len(parameters_padded)-param_length
    interacting_parameters = parameters_padded[-n_interactions:]
    for interacting_parameter in interacting_parameters:
        # Points
        points_x = df_temp[interacting_parameter].tolist()
        points_y = df_temp[quantity_mean_in].tolist()
        datapoints_x_var.append(points_x)
        datapoints_y_var.append(points_y)
        
        # Mean lines
        df_mean = df_padded.groupby(interacting_parameter, as_index=False)[quantity_mean_in].mean()
        df_mean = df_mean.sort_values(interacting_parameter)
        length = len(df_mean[quantity_mean_in].tolist())
        #nth_step = (length//n_steps)*4 + 1 # Number of rows between sampled rows to smooth out the data
        #df_mean = df_mean.iloc[::nth_step, :]
        y_mean = df_mean[quantity_mean_in]
        
        # Sliding window with the length of 1/10 ths of window
        approximate_size = len(y_mean)//3
        window_length = (approximate_size ) if (approximate_size )%2 == 1 else (approximate_size - 1)
        y_mean = savgol_filter(y_mean, window_length, 3) #SMooth out output curve
        y_mean_var.append(y_mean.tolist())
        
        # Add steps
        steps_temp = df_mean[interacting_parameter].tolist()
        steps_var.append(steps_temp)
        # All lines
        Y = np.zeros((100, len(steps_temp)))
        y_var.append(Y.tolist())
        # Add parameters
        parameters_var.append(interacting_parameter)
        
    return parameters_var, datapoints_x_var, datapoints_y_var, steps_var, y_var, y_mean_var

from sandu.sensitivity_analysis.sobol import saltelli_with_constant_bounds
from sandu import gaussian_process_emulator as gpe
import pandas as pd
import numpy as np

def semantic_operation(df_in, parameters_in, bounds_in, input_string):
    parameter_replacement_dictionary = {}
    for parameter in parameters_in:
        parameter_replacement_dictionary[str("p:" + parameter)] = parameter

    parameter_replacement_dictionary_rows = {}
    for parameter in parameters_in:
        parameter_replacement_dictionary_rows[str("p:" + parameter)] = str('row["' + parameter + '"]')
    operation_replacement_dictionary_name = {
        "o:+": "_p_",
        "o:-": "_m_",
        "o:*": "_t_",
        "o:/": "_d_",
        "o:(": "par",
        "o:)": "par"
    }
    operation_replacement_dictionary = {
        "o:+": "+",
        "o:-": "-",
        "o:*": "*",
        "o:/": "/",
        "o:(": "(",
        "o:)": ")"
    }
    replacement_dictionary = dict(parameter_replacement_dictionary, **operation_replacement_dictionary_name)

    # Check all inputs are valid
    words = input_string.split(" ")
    for word in words:
        if word not in replacement_dictionary:
            print("Prescribed operation: " + input_string)
            print("Contains invalid entry: " + word)
            return df_in, parameters_in, bounds_in

    operation_name = input_string

    for short_hand, value in replacement_dictionary.items():
        operation_name = operation_name.replace(short_hand, value)

    operation_name = operation_name.replace(" ", "")
    
    # Make sure that the name of the new parameter is not already used
    original_length = len(operation_name)
    counter = 1
    while operation_name in parameters_in:
        if len(operation_name) == original_length:
            operation_name = operation_name + str(counter)
        else:
            operation_name = operation_name[:-len(counter-1)]
            operation_name = operation_name + str(counter)
            
        counter = counter + 1

    operation_row_expression = input_string
    replacement_dictionary_rows = dict(parameter_replacement_dictionary_rows, **operation_replacement_dictionary)
    for short_hand, value in replacement_dictionary_rows.items():
        operation_row_expression = operation_row_expression.replace(short_hand, value)

    df_out = df_in
    df_out[operation_name] = df_out.apply(lambda row: eval(operation_row_expression), axis=1)
    parameters_out = parameters_in
    parameters_out.append(operation_name)
    # add new bound
    upper_bound = df_out[operation_name].max().item()
    lower_bound = df_out[operation_name].min().item()
    bounds_entry = [lower_bound, upper_bound] if upper_bound != lower_bound else [upper_bound]
    bounds_out = bounds_in
    bounds_out.append(bounds_entry)
    return df_out, parameters_out, bounds_out


def custom_inputs(df_in, parameters_in, bounds_in, interactions_in):
    #operations = ["p:p_s o:+ p:p_inf", "p:p_s o:* p:p_inf"]
    operations = interactions_in
    df_out = df_in.copy()
    parameters_out = parameters_in[:]
    bounds_out = bounds_in[:]
    try:
        for operation in operations:
            df_out, parameters_out, bounds_out = semantic_operation(df_out, parameters_out, bounds_out, operation)
    except:
        print("failed to compute interaction")
        return df_in, parameters_in, bounds_in
    else:
        return df_out, parameters_out, bounds_out
    
def custom_inputs_gpe(model_in,scaler_in,problem_in, paramters_in, quantity_in, bounds_in, N_in, N_steps, interactions_in):
    N = N_in*N_steps
    X, problem_reduced = saltelli_with_constant_bounds(problem_in, N)
    y = gpe.predict_GP_emulator(X, model_in, scaler_in)
    df_temp = pd.DataFrame(X, columns=paramters_in)
    df_temp[quantity_in] = pd.DataFrame(y)
    #Work out derived quantity
    df_padded, paramters_padded, bounds_padded = custom_inputs(df_temp,paramters_in, bounds_in, interactions_in)
    return df_padded, paramters_padded, bounds_padded
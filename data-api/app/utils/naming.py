from pathlib import Path
import re

def format_component_name(c):
    return re.sub('[\-/ ]', '_', c.lower())

def component_to_csv_file(folder, p, c):
    return Path(folder)/p/(format_component_name(c) + '.csv')

def component_to_json_file(folder, p, c):
    return Path(folder)/p/(c + '.json')

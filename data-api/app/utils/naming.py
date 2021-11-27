from pathlib import Path
import re

def format_component_name(c):
    return re.sub('[\-/ ]', '_', c.lower())

def component_to_csv_file(folder, p, c):
    return Path(folder)/p/(format_component_name(c) + '.csv')
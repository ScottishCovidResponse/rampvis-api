from flask import Blueprint

blueprint = Blueprint(
    'process_data_blueprint',
    __name__,
    url_prefix='/stat/v1/process_data/',
)

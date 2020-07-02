from flask import Blueprint

blueprint = Blueprint(
    'dynamic_data_fetch_blueprint',
    __name__,
    url_prefix='/stat/v1/data_fetch/',
)

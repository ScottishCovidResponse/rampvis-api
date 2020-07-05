from flask import Blueprint

blueprint = Blueprint(
    'stream_data_blueprint',
    __name__,
    url_prefix='/stat/v1/stream_data/',
)

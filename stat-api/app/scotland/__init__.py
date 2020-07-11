from flask import Blueprint

blueprint = Blueprint(
    'scotland_blueprint',
    __name__,
    url_prefix='/stat/v1/scotland/',
)

from flask import Blueprint

blueprint = Blueprint(
    'correlation_dynamic_blueprint',
    __name__,
    url_prefix='/stat/v1/correlation_dynamic',
)

from flask import Blueprint

blueprint = Blueprint(
    'correlation_blueprint',
    __name__,
    url_prefix='/stat/v1/correlation',
)

from flask import Flask
from flask_cors import CORS
from logging import basicConfig, DEBUG, getLogger, StreamHandler
from flask_injector import FlaskInjector
import json
from flask_restful import Api

from .utils import initialize_error_handler
from .controllers import initialize_routes
from .services import configure


def configure_logs(app):
    '''
    soft logging
    '''
    try:
        basicConfig(format='%(filename)s | %(funcName)s: %(msg)s',
                    filename='error.log', level=DEBUG)
        logger = getLogger()
        logger.addHandler(StreamHandler())
    except:
        pass


def register_extensions(app):
    # @app.teardown_appcontext
    pass


def create_app(config):
    app = Flask(__name__, static_folder='base/static')
    api = Api(app, prefix='/stat/v1')

    initialize_error_handler(app)

    app.app_context().push()

    with app.app_context():
        app.config.from_object(config)
        with open(config.CONFIG_JSON) as config_file:
            config_json = json.load(config_file)
            app.config.update(config_json)

        configure_logs(app)
        register_extensions(app)
        CORS(app, resources={r'/*': {'origins': '*'}}, send_wildcard=True)
        initialize_routes(api, app)

        # Setup dependency injection after the routes are added
        FlaskInjector(app=app, modules=[configure])

    return app

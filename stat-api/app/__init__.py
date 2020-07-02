from flask import Flask, url_for
from importlib import import_module
from logging import basicConfig, DEBUG, getLogger, StreamHandler

def register_blueprints(app):
    for module_name in ('correlation', 'scotland', 'dynamic_data_fetch'):
        module = import_module('app.{}.routes'.format(module_name))
        app.register_blueprint(module.blueprint)


def configure_logs(app):
    # soft logging
    try:
        basicConfig(filename='error.log', level=DEBUG)
        logger = getLogger()
        logger.addHandler(StreamHandler())
    except:
        pass


def create_app(config):
    app = Flask(__name__, static_folder='base/static')
    app.config.from_object(config)

    register_blueprints(app)
    configure_logs(app)

    return app

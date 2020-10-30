from flask import Flask, url_for, g
from flask_cors import CORS
from logging import basicConfig, DEBUG, getLogger, StreamHandler

from app.utils.cache_service import cache

def register_blueprints(app):
    """
    Import parts of our application
    Register Blueprints
    """
    from app.controller.correlation_controller import correlation_bp
    from app.controller.correlation_dynamic_controller import correlation_dynamic_bp
    from app.controller.process_data_controller import process_data_bp
    from app.controller.scotland_controller import scotland_bp
    from app.controller.stream_data_controller import stream_data_bp

    app.register_blueprint(correlation_bp)
    app.register_blueprint(correlation_dynamic_bp)
    app.register_blueprint(process_data_bp)
    app.register_blueprint(scotland_bp)
    app.register_blueprint(stream_data_bp)

def configure_logs(app):
    """
    soft logging
    """
    try:
        basicConfig(filename='error.log', level=DEBUG)
        logger = getLogger()
        logger.addHandler(StreamHandler())
    except:
        pass

def register_extensions(app):
    cache.init_app(app, config={'CACHE_TYPE': 'simple'})
    g.cache = cache


def create_app(config):
    app = Flask(__name__, static_folder='base/static')

    app.app_context().push()
    with app.app_context():
        app.config.from_object(config)
        configure_logs(app)
        CORS(app)
        register_blueprints(app)

    return app

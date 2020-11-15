from flask import Flask
from flask_cors import CORS
from logging import basicConfig, DEBUG, getLogger, StreamHandler
# from .infrastructure.database import CacheDB, GraphDB


def register_blueprints(app):
    """
    Import parts of our application
    Register Blueprints
    """
    from .controllers import correlation_bp, process_data_bp, scotland_bp, stream_data_bp

    app.register_blueprint(correlation_bp)
    app.register_blueprint(process_data_bp)
    app.register_blueprint(scotland_bp)
    app.register_blueprint(stream_data_bp)

    # from .controllers import graph_bp
    # app.register_blueprint(graph_bp)


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
    # CacheDB(app)
    # GraphDB(app)
    # TODO close db
    # @app.teardown_appcontext
    pass


def create_app(config):
    app = Flask(__name__, static_folder='base/static')

    app.app_context().push()
    with app.app_context():
        app.config.from_object(config)
        configure_logs(app)
        register_extensions(app)
        CORS(app)
        register_blueprints(app)

    return app

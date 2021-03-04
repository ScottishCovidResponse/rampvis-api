from .data_serve_controller import data_serve_bp
from .stream_data_controller import stream_data_bp
from .static_data_controller import static_data_bp
from .scotland_controller import scotland_bp
from .process_data_controller import process_data_bp
from .correlation_controller import correlation_bp
from .analytics_controller import analytics_bp

# from .onto_data_controller import OntoDataSearchGroup


def initialize_routes(api, app):
    # TODO: blueprints to api resource
    app.register_blueprint(correlation_bp)
    app.register_blueprint(process_data_bp)
    app.register_blueprint(scotland_bp)
    app.register_blueprint(data_serve_bp)
    app.register_blueprint(stream_data_bp)
    app.register_blueprint(static_data_bp)
    app.register_blueprint(analytics_bp)

    # Api resources
    # api.add_resource(OntoDataSearchGroup, '/onto-data/search/group', methods=['GET', 'POST'])

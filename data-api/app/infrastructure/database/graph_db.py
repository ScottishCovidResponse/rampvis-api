from flask import current_app
from neo4j import GraphDatabase
from py2neo import Graph


class GraphDB:
    def __init__(self, app=None):
        self.app = app

        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        """
        Callback can be used to initialize an application for the use with this database setup.
        """
        app.config.setdefault('NEO4J_BOLT', 'bolt://localhost')
        app.config.setdefault('NEO4J_BOLT_PORT', 7687)
        app.config.setdefault('NEO4J_USER', 'neo4j')
        app.config.setdefault('NEO4J_PASSWORD', 'neo4j')
        config_params = {
            'bolt': app.config['NEO4J_BOLT'],
            'bolt_port': app.config['NEO4J_BOLT_PORT'],
            'user': app.config['NEO4J_USER'],
            'password': app.config['NEO4J_PASSWORD'],
        }

        try:
            driver = GraphDatabase.driver(f'{config_params.get("bolt")}:{config_params.get("bolt_port")}',
                                               auth=(config_params.get('user'), config_params.get('password')))
            graph = Graph(**config_params)
        except Exception as e:
            print('GraphDB: Failed to initialise, error =', e)
        else:
            app.extensions['graph'] = graph
            app.extensions['driver'] = driver
            print('GraphDB: initialised.')

    def get_app(self, reference_app=None):
        """
        Helper method that implements the logic to look up an application.
        """
        if reference_app is not None:
            return reference_app
        if current_app:
            return current_app
        if self.app is not None:
            return self.app
        raise RuntimeError('GraphDB: Application not registered on db instance and no application bound to '
                           'current context')

    @property
    def driver(self, app=None):
        app = self.get_app(app)
        return app.extensions['driver']

    @property
    def graph(self, app=None):
        app = self.get_app(app)
        return app.extensions['graph']

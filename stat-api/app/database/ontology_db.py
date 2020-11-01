from flask import current_app
from neo4j import GraphDatabase


class OntologyDB:
    def __init__(self, app=None):
        self.app = app
        self.driver = None

        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        """
        This callback can be used to initialize an application for the use with this database setup.
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
            self.driver = GraphDatabase.driver(f'{config_params.get("bolt")}:{config_params.get("bolt_port")}',
                                               auth=(config_params.get('user'), config_params.get('password')))
        except Exception as e:
            print('OntologyDB: Failed to initialise, error =', e)

        else:
            print('OntologyDB: initialised.')
            app.extensions['ontology'] = self

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
        raise RuntimeError('OntologyDB: Application not registered on db instance and no application bound to '
                           'current context')

    @property
    def graph(self, app=None):
        app = self.get_app(app)
        return app.extensions['ontology']

    def close(self):
        if self.driver is not None:
            self.driver.close()

    def query(self, query, db=None):
        assert self.driver is not None, 'OntologyDB: Driver not initialized!'
        session = None
        response = None

        try:
            session = self.driver.session(database=db) if db is not None else self.driver.session()
            response = list(session.run(query))
        except Exception as e:
            print('OntologyDB: Query failed:', e)
        finally:
            if session is not None:
                session.close()

        return response

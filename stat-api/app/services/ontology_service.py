from flask import current_app
from neo4j import Neo4jDriver
from py2neo import Graph, Node, Relationship
from ..infrastructure.ontology import DataNode, AnalyticsEnum, ModelEnum, SourceEnum

config = current_app.config
graph: Graph = current_app.extensions['graph']
driver: Neo4jDriver = current_app.extensions['driver']


class OntologyService:
    def __init__(self):
        self.db = 'rampvisontology'
        self._init_database()

        self._init_constraints()
        self._init_indexes()
        self._init_type_nodes()

        self.create_data()

    def _init_database(self):
        self.query(f'CREATE OR REPLACE DATABASE {self.db}')

    def _init_constraints(self):
        self.query('CREATE CONSTRAINT constraint_analytics IF NOT EXISTS ON (a:Analytics) ASSERT a.name IS UNIQUE',
                   db=self.db)
        self.query('CREATE CONSTRAINT constraint_model IF NOT EXISTS ON (m:Model) ASSERT m.name IS UNIQUE',
                   db=self.db)
        self.query('CREATE CONSTRAINT constraint_source IF NOT EXISTS ON (s:Source) ASSERT s.name IS UNIQUE',
                   db=self.db)
        self.query('CREATE CONSTRAINT constraint_data IF NOT EXISTS ON (d:Data) ASSERT d.endpoint IS UNIQUE',
                   db=self.db)

        # TODO: constraints on relationship

    def _init_indexes(self):
        self.query('CREATE INDEX index_data IF NOT EXISTS FOR (d:Data) ON (d.description, d.header)', db=self.db)
        self.query('CREATE INDEX index_vis IF NOT EXISTS FOR (v:Vis) ON (v.description)', db=self.db)

    def _init_type_nodes(self):
        for d in AnalyticsEnum:
            graph.create(Node("Analytics", name=d.value))
        for d in ModelEnum:
            graph.create(Node("Model", name=d.value))
        for d in SourceEnum:
            graph.create(Node("Source", name=d.value))

    def create_data(self, data_node: DataNode = None):
        param = {
            "endpoint": 'a',
            "description": 'b',
            "header": 'c'
        }

        # if data_node.type:
        param = {
            **param,
            'name': 'Analytics'
        }

        print('OntologyService: param = ', param)
        query = 'MERGE (d: Data {endpoint: $endpoint, description: $description, header:$header})' \
                'MERGE (a: Analytics {name: "Similarity"})' \
                'MERGE (d)-[:TYPE {name: $name}]->(a)' \

        self.query(query, param, self.db)

        print('OntologyService: register_data: data_node = ', data_node, ', param = ', param)

    def create_source(self, name):
        pass

    def create_model_node(self):
        pass

    def create_analytics_node(self):
        pass

    def query(self, query, parameters=None, db=None):
        """
        Run a query in session using the native driver
        """
        assert driver is not None, 'GraphDB: Driver not initialized!'
        session = None
        response = None

        try:
            session = driver.session(database=db) if db is not None else driver.session()
            if parameters is not None:
                response = list(session.run(query, parameters=parameters))
            else:
                response = list(session.run(query))
        except Exception as e:
            print('GraphDB: Query failed:', e)
        finally:
            if session is not None:
                session.close()

        return response

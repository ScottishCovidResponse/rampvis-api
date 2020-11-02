from flask import current_app

from ..infrastructure.ontology import DataNode, AnalyticsEnum, ModelEnum, SourceEnum

config = current_app.config
ontology = current_app.extensions['ontology']


class OntologyService:
    def __init__(self):
        self.db = 'rampvisontology'
        self._init_database()
        self._init_constraints()
        self._init_indexes()
        self._init_type_nodes()

        self.create_data()

    def _init_database(self):
        ontology.query(f'CREATE OR REPLACE DATABASE {self.db}')

    def _init_constraints(self):
        ontology.query('CREATE CONSTRAINT constraint_analytics IF NOT EXISTS ON (a:Analytics) ASSERT a.name IS UNIQUE',
                       db=self.db)
        ontology.query('CREATE CONSTRAINT constraint_model IF NOT EXISTS ON (m:Model) ASSERT m.name IS UNIQUE',
                       db=self.db)
        ontology.query('CREATE CONSTRAINT constraint_source IF NOT EXISTS ON (s:Source) ASSERT s.name IS UNIQUE',
                       db=self.db)
        ontology.query('CREATE CONSTRAINT constraint_data IF NOT EXISTS ON (d:Data) ASSERT d.endpoint IS UNIQUE',
                       db=self.db)

        # TODO: constraints on relationship

    def _init_indexes(self):
        ontology.query('CREATE INDEX index_data IF NOT EXISTS FOR (d:Data) ON (d.description, d.header)', db=self.db)

        # TODO: index on vis description

    def _init_type_nodes(self):
        for d in AnalyticsEnum:
            ontology.query_parameter("CREATE (:Analytics {name: $name})", parameters={'name': d.value}, db=self.db)

        for d in ModelEnum:
            ontology.query_parameter("CREATE (:Model {name: $name})", parameters={'name': d.value}, db=self.db)

        for d in SourceEnum:
            ontology.query_parameter("CREATE (:Source {name: $name})", parameters={'name': d.value}, db=self.db)

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

        ontology.query_parameter(query, param, self.db)

        print('OntologyService: register_data: data_node = ', data_node, ', param = ', param)

        pass

    def create_source(self, name):
        pass

    def create_model_node(self):
        pass

    def create_analytics_node(self):
        pass

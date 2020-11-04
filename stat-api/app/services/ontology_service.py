from typing import Union

from flask import current_app
from neo4j import Neo4jDriver
from py2neo import Graph, Node, Relationship

from ..infrastructure.ontology import DataNode, SourceEnum, DataTypeEnum, AnalyticsEnum, ModelEnum

config = current_app.config
graph: Graph = current_app.extensions['graph']
driver: Neo4jDriver = current_app.extensions['driver']


class OntologyService:
    def __init__(self):
        print('OntologyService:')
        data_node_dto = DataNode(endpoint='g',
                                 header='h',
                                 description='d1',
                                 url_prefix='u2',
                                 type=DataTypeEnum.ANALYTICS,
                                 type_val=AnalyticsEnum.UNCERTAINTY,
                                 source=SourceEnum.SCOTLAND)
        OntologyService.create_data_node(data_node_dto)

    @staticmethod
    def create_data_node(data: DataNode):
        print('OntologyService: create_data_node: data = ', data.type)
        tx = graph.begin()

        n_data = Node('Data', url_prefix=data.url_prefix, endpoint=data.endpoint, description=data.description,
                      header=data.header)
        n_data.__primarylabel__ = "Data"
        n_data.__primarykey__ = "endpoint"

        tx.merge(n_data)

        if data.source is not None:
            n_source = OntologyService.get_or_create_source_node(data.source)
            r_data_source = Relationship(n_data, 'SOURCE', n_source, name=data.source.value)
            tx.merge(r_data_source)

        if data.type is not None:
            n_type = OntologyService.get_or_create_data_type_node(data.type, data.type_val)
            r_data_type = Relationship(n_data, 'DATA_TYPE', n_type)
            tx.merge(r_data_type)

        tx.commit()

    @staticmethod
    def get_or_create_source_node(name: SourceEnum) -> Node:
        print('get_or_create_source_node : ', name)
        n = Node("Source", name=name.value)
        n.__primarylabel__ = "Source"
        n.__primarykey__ = "name"
        return n

    @staticmethod
    def get_or_create_data_type_node(type: DataTypeEnum, type_val: Union[ModelEnum, AnalyticsEnum]) -> Node:
        print('get_or_create_data_type_node : ', type, type_val)
        n = None

        if type == DataTypeEnum.ANALYTICS:
            n = Node("Analytics", name=type_val.value)
            n.__primarylabel__ = "Analytics"
            n.__primarykey__ = "name"

        elif type == DataTypeEnum.MODEL:
            n = Node("Model", name=type_val.value)
            n.__primarylabel__ = "Model"
            n.__primarykey__ = "name"

        return n

    def create_model_node(self):
        pass

    def create_analytics_node(self):
        pass

    @staticmethod
    def query(query, parameters=None, db=None):
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

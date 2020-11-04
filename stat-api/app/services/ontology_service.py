from typing import Union

from flask import current_app
from neo4j import Neo4jDriver
from py2neo import Graph, Node, Relationship

from ..infrastructure.ontology import DataNodeDto, SourceEnum, DataTypeEnum, AnalyticsEnum, ModelEnum

config = current_app.config
graph: Graph = current_app.extensions['graph']
driver: Neo4jDriver = current_app.extensions['driver']


class OntologyService:
    def __init__(self):
        print('OntologyService:')
        data_node_dto = DataNodeDto(endpoint='e', header='h',
                                    description='d',
                                    url_prefix='u',
                                    type=DataTypeEnum.ANALYTICS,
                                    type_val=AnalyticsEnum.UNCERTAINTY,
                                    source=SourceEnum.SCOTLAND)
        OntologyService.create_data_node(data_node_dto)

    @staticmethod
    def create_data_node(data: DataNodeDto):
        print('OntologyService: create_data_node: data = ', data.type)
        tx = graph.begin()

        n_data = Node(data.label, url_prefix=data.url_prefix, endpoint=data.endpoint, description=data.description,
                      header=data.header)
        tx.merge(n_data)

        if data.source is not None:
            n_source = OntologyService.get_or_create_source_node(data.source)
            r_data_source = Relationship(n_data, 'DATA_SOURCE', n_source, name=data.source.value)
            tx.merge(r_data_source)

        if data.type is not None:
            n_type = OntologyService.get_or_create_data_type_node(data.type, data.type_val)
            r_data_type = Relationship(n_data, 'DATA_TYPE', n_type)
            tx.merge(r_data_type)

        tx.commit()

    @staticmethod
    def get_or_create_source_node(name: SourceEnum):
        print('get_or_create_source_node : ', name)
        return Node("Source", name=name.value)

    @staticmethod
    def get_or_create_data_type_node(type: DataTypeEnum, type_val: Union[ModelEnum, AnalyticsEnum]):
        print('get_or_create_data_type_node : ', type, type_val)
        if type == DataTypeEnum.ANALYTICS:
            return Node("Analytics", name=type_val.value)
        elif type == DataTypeEnum.MODEL:
            return Node("Model", name=type_val.value)

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

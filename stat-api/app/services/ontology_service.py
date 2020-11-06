from flask import current_app
from neo4j import Neo4jDriver
from py2neo import Graph, Node, Relationship, NodeMatcher

from ..infrastructure.ontology import DataNode, DataTypeEnum, VisNode

config = current_app.config
graph: Graph = current_app.extensions['graph']
driver: Neo4jDriver = current_app.extensions['driver']


class OntologyService:
    #
    # Data and related nodes
    #
    @staticmethod
    def create_data_node(data_node: DataNode):
        print('OntologyService: create_data_node: data_node = ', data_node.type)

        n_data = Node('Data', url_prefix=data_node.url_prefix, endpoint=data_node.endpoint,
                      description=data_node.description,
                      header=data_node.header)
        n_data.__primarylabel__ = "Data"
        n_data.__primarykey__ = "endpoint"

        tx = graph.begin()
        tx.merge(n_data)

        if data_node.source is not None:
            n_source = OntologyService.create_source_node(data_node.source)
            r_data_source = Relationship(n_data, 'SOURCE', n_source, name=data_node.source)
            tx.merge(r_data_source)

        if data_node.type is not None:
            n_type = OntologyService.create_data_type_node(data_node.type, data_node.type_val)
            r_data_type = Relationship(n_data, 'DATA_TYPE', n_type)
            tx.merge(r_data_type)

        tx.commit()

    @staticmethod
    def create_source_node(name: str) -> Node:
        print('get_or_create_source_node : ', name)
        n = Node("Source", name=name)
        n.__primarylabel__ = "Source"
        n.__primarykey__ = "name"
        return n

    @staticmethod
    def create_data_type_node(type: str, type_val: str) -> Node:
        print('get_or_create_data_type_node : ', type, type_val)
        n = None

        if DataTypeEnum(type) is DataTypeEnum.ANALYTICS:
            n = Node("Analytics", name=type_val)
            n.__primarylabel__ = "Analytics"
            n.__primarykey__ = "name"

        elif DataTypeEnum(type) is DataTypeEnum.MODEL:
            n = Node("Model", name=type_val)
            n.__primarylabel__ = "Model"
            n.__primarykey__ = "name"

        return n

    @staticmethod
    def get_data_nodes():
        # query = 'MATCH (d: Data)'
        nodes = NodeMatcher(graph).match("Data")
        return list(nodes)

    #
    # Vis and related nodes
    #
    @staticmethod
    def create_vis_node(vis_node: VisNode):
        print('OntologyService: create_vis_node: vis_node = ', vis_node)
        n_vis = Node('Vis', name=vis_node.name, description=vis_node.description)
        n_vis.__primarylabel__ = "Vis"
        n_vis.__primarykey__ = "name"

        tx = graph.begin()

        n_vis_type = OntologyService.create_vis_type_node(vis_node.vis_type)
        r_vis_vis_type = Relationship(n_vis, 'VIS_TYPE', n_vis_type)
        tx.merge(r_vis_vis_type)

        tx.commit()

    @staticmethod
    def create_vis_type_node(name: str) -> Node:
        print('create_vis_type_node: name = ', name)
        n = Node("VisType", name=name)
        n.__primarylabel__ = "VisType"
        n.__primarykey__ = "name"
        return n

    #
    # Database query
    #
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

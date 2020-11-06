from flask import current_app, jsonify
from neo4j import Neo4jDriver, Result
from py2neo import Graph, Node, Relationship, NodeMatcher

from ..infrastructure.ontology import DataNode, DataTypeEnum, VisNode

config = current_app.config
graph: Graph = current_app.extensions['graph']
driver: Neo4jDriver = current_app.extensions['driver']


class GraphService:
    #
    # Data and related nodes
    #
    @staticmethod
    def create_data_node(data_node: DataNode):
        print('GraphService: create_data_node: data_node = ', data_node.type)

        n_data = Node('Data', url_prefix=data_node.url_prefix, endpoint=data_node.endpoint,
                      description=data_node.description,
                      header=data_node.header)
        n_data.__primarylabel__ = "Data"
        n_data.__primarykey__ = "endpoint"

        tx = graph.begin()
        tx.merge(n_data)

        if data_node.source is not None:
            n_source = GraphService.create_source_node(data_node.source)
            r_data_source = Relationship(n_data, 'SOURCE', n_source, name=data_node.source)
            tx.merge(r_data_source)

        if data_node.type is not None:
            n_type = GraphService.create_data_type_node(data_node.type, data_node.type_val)
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
        query = 'MATCH (d:Data) -[d_s:SOURCE]-> (s)' \
                'MATCH (d) -[d_t:DATA_TYPE]-> (t)' \
                'RETURN d, (s), d_t, (t)'
        # query = 'MATCH (d:Data) RETURN d.endpoint'
        result = GraphService.run(query)
        values = []

        # print('\n', results, results.single())
        for ix, record in enumerate(result[0]):
            # if x > 1:
            #     break
            values.append(record)
            print('\n', record)

        # info = result.consume()  # discard the remaining records if there are any
        # print('\ninfo = ', info)

        # use the info for logging etc.
        # nodes = NodeMatcher(graph).match("Data").all()
        # for n in nodes:
        #     print('\n', n)

        return []

    #
    # Vis and related nodes
    #
    @staticmethod
    def create_vis_node(vis_node: VisNode):
        print('GraphService: create_vis_node: vis_node = ', vis_node)
        n_vis = Node('Vis', name=vis_node.name, description=vis_node.description)
        n_vis.__primarylabel__ = "Vis"
        n_vis.__primarykey__ = "name"

        tx = graph.begin()

        n_vis_type = GraphService.create_vis_type_node(vis_node.vis_type)
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
    def run(query, parameters=None, db=None):
        """
        Run a query in session using the native driver
        """
        assert driver is not None, 'GraphDB: Driver not initialized!'
        session = None
        result = None

        try:
            session = driver.session(database=db) if db is not None else driver.session()
            if parameters is None:
                result = list(session.run(query))
                # print('single = ', response.single(), '\nvalue = ', response.value(), '\nconsume=', response.consume())
                # values = []
                #
                # # print('\n', results, results.single())
                # for ix1, record1 in enumerate(result):
                #     # if x > 1:
                #     #     break
                #     # values.append(record.values())
                #     print('\n 1', ix1, record1.values())
                #     for ix2, record2 in enumerate(record1.values()):
                #         print('\n 2', ix2, record2.values())
                #
                #         # for ix3, record3 in enumerate(record.values()):
                #         #     print('\n 2', ix2, record.values())
                #
                # info = result.consume()  # discard the remaining records if there are any
                # print('\ninfo = ', info)
            else:
                result = list(session.run(query, parameters=parameters))
        except Exception as e:
            print('GraphDB: Query failed:', e)
        finally:
            if session is not None:
                session.close()

        return result

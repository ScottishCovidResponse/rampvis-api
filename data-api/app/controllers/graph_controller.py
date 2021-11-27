#
# TODO: Review this code and integrate later.
#
import json
from flask import request, Blueprint, Response
from marshmallow import ValidationError

from ..infrastructure.ontology import DataNode, DataSchema, VisSchema, VisNode
from ..services import GraphService
from ..utils import validate_token

graph_bp = Blueprint(
    'graph_bp',
    __name__,
    url_prefix='/stat/v1/graph',
)

graph_service = GraphService()
data_schema = DataSchema()
vis_schema = VisSchema()


@graph_bp.route('/data/create', methods=['POST'])
@validate_token
def create_data():
    req = request.get_json()
    print('ontology_controller: create_data: req = ', req)

    if not req:
        return {"message": "No input data provided"}, 400
    try:
        data = data_schema.load(req)  # validation
    except ValidationError as err:
        return err.messages, 422
    else:
        print('ontology_controller: create_data: data = ', data)
        data_node = DataNode.deserialize(data)
        GraphService.create_data_node(data_node)
        return {"message": "Created"}, 200


@graph_bp.route('/data/get', methods=['GET'])
@validate_token
def get_data():
    data = GraphService.get_data_nodes()
    return Response(json.dumps(data), mimetype='application/json')


@graph_bp.route('/vis/create', methods=['POST'])
@validate_token
def create_vis():
    req = request.get_json()
    print('ontology_controller: create_vis: req = ', req)

    if not req:
        return {"message": "No input data provided"}, 400
    try:
        vis = vis_schema.load(req)  # validation
    except ValidationError as err:
        return err.messages, 422
    else:
        print('ontology_controller: create_vis: vis = ', vis)
        vis_node = VisNode.deserialize(vis)
        GraphService.create_vis_node(vis_node)
        return {"message": "Created"}, 200


@graph_bp.route('/data/get', methods=['GET'])
@validate_token
def get_vis():
    pass

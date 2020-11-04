import json

from flask import Response, request, Blueprint
from marshmallow import ValidationError

from ..infrastructure.ontology import DataNode, DataSchema
from ..services import OntologyService

ontology_bp = Blueprint(
    'ontology_bp',
    __name__,
    url_prefix='/stat/v1/ontology',
)

ontology_service = OntologyService()
data_schema = DataSchema()


@ontology_bp.route('/data/create', methods=['POST'])
# @validate_token
def query():
    req = request.get_json()
    print('ontology_controller: req = ', req)

    if not req:
        return {"message": "No input data provided"}, 400
    try:
        data = data_schema.load(req)
        print('ontology_controller: data = ', data)
    except ValidationError as err:
        return err.messages, 422
    else:
        print('ontology_controller: data = ', data)
        data_node = DataNode.deserialize(data)
        print(data_schema.dumps(data_node))
        return Response(json.dumps({'message': f'ontology_controller'}), mimetype='application/json')

import os
import json
from flask import Response, request, abort, Blueprint
from ..utils import validate_token
from ..services import OntologyService

ontology_bp = Blueprint(
    'ontology_bp',
    __name__,
    url_prefix='/stat/v1/ontology',
)

ontology_service = OntologyService()


@ontology_bp.route('/data/create', methods=['GET'])
@validate_token
def query():
    print('ontology_controller: ')
    return Response(json.dumps({'message': f'ontology_controller'}), mimetype='application/json')

import logging as log
from flask import Response, current_app, Blueprint, request, abort
from injector import inject
import json
from flask_restful import Resource

from ..utils import validate_token
from ..services import DatabaseService, SearchService
from ..algorithms import Ranking
from ..utils import NumpyEncoder
from ..utils import APIInternalServerError


class OntoDataSearchController(Resource):

    @inject
    def __init__(self,
                 database_service: DatabaseService,
                 search_service: SearchService,
                 ranking: Ranking,
                 ):
        self.database_service = database_service
        self.search_service = search_service
        self.ranking = ranking

    @validate_token
    def get(self):
        # Test error
        try:
            a = 10 / 0

        except Exception as e:
            raise APIInternalServerError()

        return Response(json.dumps({'name': 'OntoDataSearchController', 'type': 'GET'}))

    @validate_token
    def post(self):
        body = request.get_json()
        vis_id = body.get('visId', None)
        must_keys = body.get('mustKeys', None)
        should_keys = body.get('shouldKeys', None)
        filter_keys = body.get('filterKeys', None)
        must_not_keys = body.get('mustNotKeys', None)
        minimum_should_match = body.get('minimumShouldMatch', None)
        alpha = float(body.get('alpha', None))
        beta = float(body.get('beta', None))
        cluster = body.get('cluster', None)
        numClusters = body.get('numClusters', None)

        log.info(f'OntoDataSearchController:post: query params = {vis_id}, {must_keys}, {should_keys}, {must_not_keys}, {filter_keys}, {minimum_should_match}, {alpha}, {beta}, {cluster}')
        
        if (not must_keys) and (not should_keys) and (not filter_keys):
            abort(400, 'Invalid parameters for keywords')  # TODO

        if (not cluster) and (not numClusters):
            abort(400, 'Invalid parameters for cluster')  # TODO

        # 1
        examples = self.database_service.find_example_data_of_vis(vis_id)
        #log.debug(f'examples = {examples}')
        # 2
        query = self.search_service.build_query(
            must_keys, should_keys, filter_keys, must_not_keys, minimum_should_match)
        log.debug(f'OntoDataSearchController:post: query = {query}')

        # 3
        searched = self.search_service.search(query)
        #log.debug(f'searched = {searched}')
        log.debug(f'OntoDataSearchController:post: len(examples) = {len(examples)}, len(searched) = {len(searched)}')

        M1 = self.ranking.M1(examples, searched, must_keys, alpha, beta)
        log.debug(f'OntoDataSearchController:post: len(M1) = {len(M1)}')

        M2 = self.ranking.M2(searched, must_keys + should_keys, alpha, beta)
        log.debug(f'OntoDataSearchController:post: len(M2) = {len(M2)}')

        if not numClusters:
            n_clusters = int(len(searched) / len(examples))
        else:
            n_clusters = int(numClusters)

        log.debug(f'OntoDataSearchController:post: len(examples) = {len(examples)}')
        log.debug(f'OntoDataSearchController:post: n_clusters = {n_clusters}')

        clusters = self.ranking.cluster(M2, n_clusters)
        log.debug(f'OntoDataSearchController:post: len(clusters) = {len(clusters)}')

        groups = self.ranking.group_data_streams(M1, searched, clusters)
        log.debug(
            f'OntoDataSearchController:post: len(groups) = {len(groups)}')

        return Response(json.dumps(groups, cls=NumpyEncoder), mimetype='application/json')

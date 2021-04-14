import json
from loguru import logger
from fastapi import APIRouter, Depends, Response
from starlette.exceptions import HTTPException
from starlette.status import (
    HTTP_422_UNPROCESSABLE_ENTITY,
    HTTP_500_INTERNAL_SERVER_ERROR,
)

from app.utils.jwt_service import validate_user_token
from app.core.propagate_data_query_model import PropagateDataQueryModel
from app.utils.numpy_encoder import NumpyEncoder
from app.services.database_service import DatabaseService
from app.services.mongodb_service import MongoDBService
from app.services.search_service import SearchService
from app.services.elasticsearch_service import ElasticsearchService
from app.algorithms.ranking import Ranking


onto_data_search_controller = APIRouter()


@onto_data_search_controller.get("/ping")
async def ping(
    database_service: DatabaseService = Depends(MongoDBService),
    search_service: SearchService = Depends(ElasticsearchService),
):
    status = {
        "database_service": f"{database_service.ping()}",
        "search_service": f"{search_service.ping()}",
    }
    logger.info(f"{status}")
    return status


@onto_data_search_controller.post("/group", dependencies=[Depends(validate_user_token)])
async def search_group(
    query: PropagateDataQueryModel,
    database_service: DatabaseService = Depends(MongoDBService),
    search_service: SearchService = Depends(ElasticsearchService),
    ranking: Ranking = Depends(Ranking),
):
    """
    TODO: use query model and validation
    """
    logger.info(f"propagate_data_query = {query}")
    visId = query.visId
    mustKeys = query.mustKeys
    shouldKeys = query.shouldKeys
    filterKeys = query.filterKeys
    mustNotKeys = query.mustNotKeys
    minimumShouldMatch = query.minimumShouldMatch
    alpha = query.alpha
    beta = query.beta

    logger.info(
        f"OntoDataSearchController:post: query params = {visId}, {mustKeys}, {shouldKeys}, {mustNotKeys}, {filterKeys}, {minimumShouldMatch}, {alpha}, {beta}"
    )

    if visId is None or mustKeys is None or shouldKeys is None or filterKeys is None:
        raise HTTPException(
            status_code=HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Required parameters: visId, mustKeys, shouldKeys, filterKeys",
        )

    # 1
    examples = database_service.find_example_data_of_vis(visId)
    # log.debug(f'examples = {examples}')
    # 2
    query = search_service.build_query(
        mustKeys, shouldKeys, filterKeys, mustNotKeys, minimumShouldMatch
    )
    logger.debug(f"OntoDataSearchController:post: query = {query}")

    # 3
    searched = search_service.search(query)
    # log.debug(f'searched = {searched}')
    logger.debug(
        f"OntoDataSearchController:post: len(examples) = {len(examples)}, len(searched) = {len(searched)}"
    )

    M1 = ranking.M1(examples, searched, mustKeys, alpha, beta)
    logger.debug(f"OntoDataSearchController:post: len(M1) = {len(M1)}")

    M2 = ranking.M2(searched, mustKeys + shouldKeys, alpha, beta)
    logger.debug(f"OntoDataSearchController:post: len(M2) = {len(M2)}")

    n_clusters = int(len(searched) / len(examples))

    logger.debug(f"OntoDataSearchController:post: len(examples) = {len(examples)}")
    logger.debug(f"OntoDataSearchController:post: n_clusters = {n_clusters}")

    clusters = ranking.cluster(M2, n_clusters)
    logger.debug(f"OntoDataSearchController:post: len(clusters) = {len(clusters)}")

    groups = ranking.group_data_streams(M1, searched, clusters)
    logger.debug(f"OntoDataSearchController:post: len(groups) = {len(groups)}")

    from fastapi.encoders import jsonable_encoder
    from fastapi.responses import JSONResponse

    return Response(
        content=json.dumps(groups, cls=NumpyEncoder), media_type="application/json"
    )

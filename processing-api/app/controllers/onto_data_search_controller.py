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
from app.algorithms.propagation import Propagation


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
    propagation: Propagation = Depends(Propagation),
):
    """
    TODO: use query model and validation
    """
    logger.info(f"propagate_data_query = {query}")
    visId: str = query.visId
    mustKeys: list[str] = query.mustKeys
    shouldKeys: list[str] = query.shouldKeys
    filterKeys: list[str] = query.filterKeys
    mustNotKeys: list[str] = query.mustNotKeys
    minimumShouldMatch: int = query.minimumShouldMatch
    alpha: float = query.alpha
    beta: float = query.beta
    theta: float = query.theta
    clusteringAlgorithm: str = query.clusteringAlgorithm

    logger.info(
        f"query params = {visId}, {mustKeys}, {shouldKeys}, {mustNotKeys}, {filterKeys}, {minimumShouldMatch}, {alpha}, {beta}, {theta}, {clusteringAlgorithm}"
    )

    if visId is None or mustKeys is None or shouldKeys is None or filterKeys is None:
        raise HTTPException(
            status_code=HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Required parameters: visId, mustKeys, shouldKeys, filterKeys",
        )

    # 1
    example = database_service.find_example_data_of_vis(visId)
    # log.debug(f'examples = {examples}')
    # 2
    query = search_service.build_query(
        mustKeys, shouldKeys, filterKeys, mustNotKeys, minimumShouldMatch
    )
    logger.debug(f"OntoDataSearchController:post: query = {query}")

    # 3
    discovered = search_service.search(query)
    # log.debug(f'searched = {searched}')
    logger.debug(
        f"OntoDataSearchController:post: len(examples) = {len(example)}, len(searched) = {len(discovered)}"
    )

    if len(discovered) <= 0:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No matching data streams found! Pease update the search query.",
        )

    try:
        Srd = propagation.Srd(example, discovered, mustKeys, alpha, beta, theta)
        logger.info(f"OntoDataSearchController:post: len(M1) = {len(Srd)}")
    except Exception as e:
        logger.error(f"OntoDataSearchController:post: e = {e}")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Srd Computation: {e}",
        )

    try:
        Sdd = propagation.Sdd(discovered, mustKeys + shouldKeys, alpha, beta, theta)
        logger.info(f"OntoDataSearchController:post: len(M2) = {len(Sdd)}")
    except Exception as e:
        logger.error(f"OntoDataSearchController:post: e = {e}")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sdd Computation: {e}",
        )


    n_clusters = int(len(discovered) / len(example))

    logger.debug(f"OntoDataSearchController:post: len(examples) = {len(example)}")
    logger.debug(f"OntoDataSearchController:post: n_clusters = {n_clusters}")

    clusters = propagation.cluster(Sdd, n_clusters)
    logger.debug(f"OntoDataSearchController:post: len(clusters) = {len(clusters)}")

    groups = propagation.group_data_streams(Srd, discovered, clusters)
    logger.debug(f"OntoDataSearchController:post: len(groups) = {len(groups)}")

    return Response(
        content=json.dumps(groups, cls=NumpyEncoder), media_type="application/json"
    )

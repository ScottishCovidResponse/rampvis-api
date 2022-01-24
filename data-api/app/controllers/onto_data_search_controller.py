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
        f"Propagate: query params = {visId}, {mustKeys}, {shouldKeys}, {mustNotKeys}, {filterKeys}, {minimumShouldMatch}, {alpha}, {beta}, {theta}, {clusteringAlgorithm}"
    )

    if visId is None or mustKeys is None or shouldKeys is None or filterKeys is None:
        raise HTTPException(
            status_code=HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Required parameters: visId, mustKeys, shouldKeys, filterKeys",
        )

    # 1
    example = database_service.find_example_data_of_vis(visId)

    # 2
    query = search_service.build_query(
        mustKeys, shouldKeys, filterKeys, mustNotKeys, minimumShouldMatch
    )
    logger.info(f"Propagate: search query = {query}")

    # 3
    discovered = search_service.search(query)
    logger.info(
        f"Propagate: search response, len(examples) = {len(example)}, len(discovered) = {len(discovered)}"
    )

    if len(discovered) <= 0:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No matching data streams found! Pease update the search query.",
        )

    try:
        Srd = propagation.Srd(example, discovered, mustKeys, alpha, beta, theta)
    except Exception as e:
        logger.error(f"Propagate: Srd computation error = {e}")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Propagate: Srd computation error = {e}",
        )

    try:
        Sdd = propagation.Sdd(discovered, mustKeys + shouldKeys, alpha, beta, theta)
    except Exception as e:
        logger.error(f"Propagate: Sdd computation error = {e}")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Propagate: Sdd computation error = {e}",
        )


    n_clusters = int(len(discovered) / len(example))

    logger.info(
        f"Propagate: len(examples) = {len(example)}, len(discovered) = {len(discovered)}"
    )
    logger.debug(f"Propagate: n_clusters = {n_clusters}")

    clusters = propagation.cluster(Sdd, n_clusters)
    groups = propagation.group_data_streams(Srd, discovered, clusters)

    return Response(
        content=json.dumps(groups, cls=NumpyEncoder), media_type="application/json"
    )

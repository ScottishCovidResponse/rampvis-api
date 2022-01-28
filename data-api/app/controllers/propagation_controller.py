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

use_gpu = False
propagation_controller = APIRouter()


@propagation_controller.get("/ping", dependencies=[Depends(validate_user_token)])
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


@propagation_controller.post("/group", dependencies=[Depends(validate_user_token)])
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
    processor: str = query.processor
    maxSearchWindow: int = query.maxSearchWindow

    logger.info(
        f"Propagation: query params = {visId}, {mustKeys}, {shouldKeys}, {mustNotKeys}, {filterKeys}, {minimumShouldMatch}"
    )
    logger.info(
        f"Propagation: search settings = {alpha}, {beta}, {theta}, {clusteringAlgorithm}, {processor}, {maxSearchWindow}"
    )

    if processor == "GPU":
        use_gpu = True
        from app.algorithms.cluster_gpu import cluster_gpu
        from numba import cuda

        if not cuda.is_available():
            raise HTTPException(
                status_code=HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"PropagationController: CUDA is not available",
            )

    if visId is None or mustKeys is None or shouldKeys is None or filterKeys is None:
        raise HTTPException(
            status_code=HTTP_422_UNPROCESSABLE_ENTITY,
            detail="PropagationController: Required parameters: visId, mustKeys, shouldKeys, filterKeys",
        )

    reference = database_service.find_example_data_of_vis(visId)
    logger.info(f"PropagationController: len(reference) = {len(reference)}")

    query = search_service.build_query(
        mustKeys, shouldKeys, filterKeys, mustNotKeys, minimumShouldMatch
    )
    logger.info(f"PropagationController: search query = {query}")

    try:
        discovered = search_service.search(query, maxSearchWindow)
        logger.info(
            f"PropagationController: search response, len(discovered) = {len(discovered)}"
        )
    except Exception as e:
        logger.error(f"PropagationController: search error = {e}")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PropagationController: search error = {e}",
        )

    if len(discovered) <= 0:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PropagationController: No matching data streams found! Pease update the search query.",
        )
    if len(reference) == 1:
        logger.info(
            f"PropagationController: len(reference) = {len(reference)}, return data streams"
        )
        return Response(
            content=json.dumps(
                propagation.group_single_data_stream(discovered), cls=NumpyEncoder
            ),
            media_type="application/json",
        )

    try:
        Srd = propagation.Srd(reference, discovered, mustKeys, alpha, beta, theta)
    except Exception as e:
        logger.error(f"PropagationController: Srd computation error = {e}")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PropagationController: Srd computation error = {e}",
        )

    try:
        Sdd = propagation.Sdd(discovered, mustKeys + shouldKeys, alpha, beta, theta)
    except Exception as e:
        logger.error(f"PropagationController: Sdd computation error = {e}")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PropagationController: Sdd computation error = {e}",
        )

    n_clusters = int(len(discovered) / len(reference))

    logger.info(
        f"PropagationController: len(examples) = {len(reference)}, len(discovered) = {len(discovered)}"
    )
    logger.debug(f"PropagationController: n_clusters = {n_clusters}")

    clusters = None

    try:
        if processor == "GPU":
            from app.algorithms.cluster_gpu import cluster_gpu
            from numba import cuda

            if cuda.is_available():
                clusters = cluster_gpu(Sdd, n_clusters)
            else:
                raise HTTPException(
                    status_code=HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"PropagationController: CUDA is not available, error = {e}",
                )
        else:
            clusters = propagation.cluster(Sdd, n_clusters)
    except Exception as e:
        logger.error(f"PropagationController: clustering error = {e}")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PropagationController: clustering error = {e}",
        )

    groups = propagation.group_data_streams(Srd, discovered, clusters)
    logger.debug(f"PropagationController: returning len(groups) = {len(groups)}")

    return Response(
        content=json.dumps(groups, cls=NumpyEncoder), media_type="application/json"
    )

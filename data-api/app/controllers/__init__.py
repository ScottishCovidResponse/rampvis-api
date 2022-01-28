from fastapi import APIRouter

router = APIRouter()

# run agents
from app.controllers.data_serve_controller import data_serve_controller
from app.controllers.agents.data_downloader_agent import data_downloader_agent
from app.controllers.static_data_controller import static_data_controller
from app.controllers.timeseries_sim_search_controller import (
    timeseries_sim_search_controller,
)

router.include_router(data_serve_controller, prefix="/stat/v1/data")
router.include_router(data_downloader_agent, prefix="/stat/v1/download_data")
router.include_router(static_data_controller, prefix="/stat/v1/static_data")
router.include_router(
    timeseries_sim_search_controller, prefix="/stat/v1/timeseries-sim-search"
)

# ensemble
from app.controllers.ensemble_controller import (
    ensemble_controller,
)

router.include_router(ensemble_controller, prefix="/stat/v1/ensemble")

# storyboarding
from app.controllers.storyboarding_data_controller import storyboarding_data_controller

router.include_router(storyboarding_data_controller, prefix="/stat/v1/storyboarding")

# propagation
from app.controllers.propagation_controller import propagation_controller

router.include_router(propagation_controller, prefix="/stat/v1/propagation")

# token
from app.controllers.token_controller import token_controller

router.include_router(token_controller, prefix="/token")


# TODO: V0.4 (deprecated and delete)
from app.controllers.analytics_controller import analytics_controller
from app.controllers.correlation_controller import correlation_controller
from app.controllers.scotland_analytics_controller import scotland_analytics_controller
from app.controllers.process_data_controller import process_data_controller

router.include_router(
    analytics_controller, prefix="/stat/v1/percentiles/model/eera/age-groups"
)
router.include_router(correlation_controller, prefix="/stat/v1/correlation")
router.include_router(scotland_analytics_controller, prefix="/stat/v1/scotland")
router.include_router(process_data_controller, prefix="/stat/v1/process_data")


#
# How to validate key here?
#
# from app.core.key import validate_request
# router.include_router(
#     hello_router, prefix="/hello", dependencies=[Depends(validate_request)]
# )

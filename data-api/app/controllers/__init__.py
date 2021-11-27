from fastapi import APIRouter

from app.controllers.token_controller import token_controller
from app.controllers.data_serve_controller import data_serve_controller
from app.controllers.data_downloader_agent import data_downloader_agent
from app.controllers.static_data_controller import static_data_controller
from app.controllers.onto_data_search_controller import onto_data_search_controller
from app.controllers.analytics_controller import analytics_controller
from app.controllers.correlation_controller import correlation_controller
from app.controllers.scotland_analytics_controller import scotland_analytics_controller
from app.controllers.process_data_controller import process_data_controller
from app.controllers.timeseries_sim_search_controller import (
    timeseries_sim_search_controller,
)
from app.controllers.ensemble_controller import (
    ensemble_controller,
)

# Just load the module so that the scheduler can start
import app.controllers.sensitivity_analysis_agent

import app.controllers.uncertainty_mean_sample_agent
import app.controllers.uncertainty_clustering_agent
import app.controllers.uncertainty_cluster_mean_sample_agent

router = APIRouter()

router.include_router(token_controller, prefix="/token")
router.include_router(data_serve_controller, prefix="/stat/v1/data")
router.include_router(data_downloader_agent, prefix="/stat/v1/download_data")
router.include_router(static_data_controller, prefix="/stat/v1/static_data")
router.include_router(onto_data_search_controller, prefix="/stat/v1/onto-data/search")
router.include_router(
    timeseries_sim_search_controller, prefix="/stat/v1/timeseries-sim-search"
)
router.include_router(
    ensemble_controller, prefix="/stat/v1/ensemble"
)

# V0.4 (to check again)
router.include_router(
    analytics_controller, prefix="/stat/v1/percentiles/model/eera/age-groups"
)
router.include_router(correlation_controller, prefix="/stat/v1/correlation")
router.include_router(scotland_analytics_controller, prefix="/stat/v1/scotland")
router.include_router(process_data_controller, prefix="/stat/v1/process_data")


#
# Example: validate key here
#
# from app.core.key import validate_request
# router.include_router(
#     hello_router, prefix="/hello", dependencies=[Depends(validate_request)]
# )

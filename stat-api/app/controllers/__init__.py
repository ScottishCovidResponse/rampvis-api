from fastapi import APIRouter, Depends

from app.controllers.token_controller import token_controller
from app.controllers.data_serve_controller import data_serve_controller
from app.controllers.stream_data_controller import stream_data_controller
from app.controllers.static_data_controller import static_data_controller
from app.controllers.onto_data_search_controller import onto_data_search_controller
from app.controllers.analytics_controller import analytics_controller
from app.controllers.correlation_controller import correlation_controller
from app.controllers.scotland_analytics_controller import scotland_analytics_controller
from app.controllers.process_data_controller import process_data_controller


router = APIRouter()

router.include_router(token_controller, prefix="/token")
router.include_router(data_serve_controller, prefix="/stat/v1/data")
router.include_router(stream_data_controller, prefix="/stat/v1/stream_data")
router.include_router(static_data_controller, prefix="/stat/v1/static_data")
# search / database service
router.include_router(onto_data_search_controller, prefix="/stat/v1/onto-data/search")

# V0.4 (to check again)
router.include_router(analytics_controller, prefix="/stat/v1/percentiles/model/eera/age-groups")
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

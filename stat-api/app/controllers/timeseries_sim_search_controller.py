import json
from loguru import logger
from fastapi import APIRouter, Query, Response


timeseries_sim_search_controller = APIRouter()


@timeseries_sim_search_controller.get("/")
async def search(q1=Query(None), q2=Query(None)):
    logger.info(f"timeseries_sim_search_controller q1 = {q1}, q2={q2}")

    # Write the search logic and data etc.
    result = {"q1": q1, "q2": q2}

    return Response(content=json.dumps(result), media_type="application/json")

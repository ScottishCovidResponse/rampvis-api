import uvicorn
from loguru import logger
from fastapi import FastAPI
from starlette.middleware.gzip import GZipMiddleware
from starlette.middleware.cors import CORSMiddleware

from app.core.config import PROJECT_NAME
from app.core.settings import GLOBAL_CONFIG_OBJ
from app.core.settings import DEFAULT_ROUTE_STR
from app.controllers import router

logger.info(f"PROJECT_NAME = {PROJECT_NAME}")
logger.debug(f"GLOBAL_CONFIG_OBJ = {GLOBAL_CONFIG_OBJ}")

app = FastAPI(title=PROJECT_NAME)
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=GLOBAL_CONFIG_OBJ["allowOriginRegex"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix=DEFAULT_ROUTE_STR)


@app.get("/stat/v1/ping")
def ping():
    return {"ping": "live"}


if __name__ == "__main__":
    uvicorn.run(app, log_level="debug", reload=True)

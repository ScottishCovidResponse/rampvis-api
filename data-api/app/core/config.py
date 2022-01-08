import logging
import sys

from app.core.logging import InterceptHandler
from loguru import logger
from starlette.config import Config

config = Config(".env")

PROJECT_NAME: str = config("PROJECT_NAME", default="rampvis:data-api")

DEBUG: bool = config("DEBUG", cast=bool, default=True)
LOGGING_LEVEL = logging.DEBUG if DEBUG else logging.INFO
logging.basicConfig(
    handlers=[InterceptHandler(level=LOGGING_LEVEL)], level=LOGGING_LEVEL
)
logger.configure(handlers=[{"sink": sys.stderr, "level": LOGGING_LEVEL}])

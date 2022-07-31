import json
import os
from os import environ
import sys
from loguru import logger
from starlette.datastructures import CommaSeparatedStrings


DEFAULT_ROUTE_STR: str = ""

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
RSA_PVT_KEY = BASE_DIR + '/../' + 'config/keys/jwtRS256.key'
RSA_PUB_KEY = BASE_DIR + '/../' + 'config/keys/jwtRS256.key.pub'

DATA_PATH_V04 = BASE_DIR + '/../../../' + 'data/v04'
DATA_PATH_RAW = BASE_DIR + '/../../../' + 'data/raw'
DATA_PATH_LIVE = BASE_DIR + '/../../../' + 'data/live'
DATA_PATH_STATIC = BASE_DIR + '/../../../' + 'data/static'
DATA_MODEL = BASE_DIR + '/../../../' + 'data/scotland/model'


env = environ.get('ENV', 'development')
logger.info(f'ENV = {env}')

if env == 'production':
    GLOBAL_CONFIG_FILE = BASE_DIR + '/../' + 'config/production.json'
else:
    GLOBAL_CONFIG_FILE = BASE_DIR + '/../' + 'config/default.json'

GLOBAL_CONFIG_OBJ = None
with open(GLOBAL_CONFIG_FILE) as config_file:
    GLOBAL_CONFIG_OBJ = json.load(config_file)

RSA_PUB_KEY = BASE_DIR + '/../' + 'config/keys/jwtRS256.key.pub'

ALLOWED_HOSTS = CommaSeparatedStrings(os.getenv("ALLOWED_HOSTS", "*"))

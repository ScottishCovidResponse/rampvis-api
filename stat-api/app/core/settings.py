import json
import os
import logging
import sys

DEFAULT_ROUTE_STR: str = "/stat/v1"


BASE_DIR = os.path.abspath(os.path.dirname(__file__))
RSA_PUB_KEY = BASE_DIR + '/../../../' + 'data-api/config/keys/jwtRS256.key.pub'

DATA_PATH_V04 = BASE_DIR + '/../../../' + 'data/v04'
DATA_PATH_RAW = BASE_DIR + '/../../../' + 'data/raw'
DATA_PATH_LIVE = BASE_DIR + '/../../../' + 'data/live'
DATA_PATH_STATIC = BASE_DIR + '/../../../' + 'data/static'
DATA_MODEL = BASE_DIR + '/../../../' + 'data/scotland/model'

NEO4J_BOLT = 'bolt://localhost'
NEO4J_BOLT_PORT = 7687
NEO4J_USER = 'neo4j'
NEO4J_PASSWORD = 'pass123'

GLOBAL_CONFIG_FILE = BASE_DIR + '/../../../' + 'data-api/config/default.json'
GLOBAL_CONFIG_OBJ = None
with open(GLOBAL_CONFIG_FILE) as config_file:
    GLOBAL_CONFIG_OBJ = json.load(config_file)

RSA_PUB_KEY = BASE_DIR + '/../../../' + 'data-api/config/keys/jwtRS256.key.pub'
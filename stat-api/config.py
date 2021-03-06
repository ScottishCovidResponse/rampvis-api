import os
import json


class Config(object):
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    RSA_PUB_KEY = BASE_DIR + '/' + '../data-api/config/keys/jwtRS256.key.pub'

    DATA_PATH_V04 = BASE_DIR + '/' + '../data/v04'
    DATA_PATH_RAW = BASE_DIR + '/' + '../data/raw'
    DATA_PATH_LIVE = BASE_DIR + '/' + '../data/live'
    DATA_PATH_STATIC = BASE_DIR + '/' + '../data/static'
    DATA_MODEL = BASE_DIR + '/' + '../data/scotland/model'

    NEO4J_BOLT = 'bolt://localhost'
    NEO4J_BOLT_PORT = 7687
    NEO4J_USER = 'neo4j'
    NEO4J_PASSWORD = 'pass123'


class DevelopmentConfig(Config):
    DEBUG = True
    PROPAGATE_EXCEPTIONS = True

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    CONFIG_JSON = BASE_DIR + '/' + '../data-api/config/default.json'


class ProductionConfig(Config):
    PROPAGATE_EXCEPTIONS = True
    DEBUG = False

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    CONFIG_JSON = BASE_DIR + '/' + '../data-api/config/production.json'


config_by_name = dict(
    development=DevelopmentConfig,
    production=ProductionConfig
)

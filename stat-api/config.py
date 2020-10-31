import os


class Config(object):
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    RSA_PUB_KEY = BASE_DIR + '/' + '../data-api/config/keys/jwtRS256.key.pub'
    DATA_PATH_V04 = BASE_DIR + '/' + '../data/v04'
    DATA_PATH_RAW = BASE_DIR + '/' + '../data/raw'
    DATA_PATH_LIVE = BASE_DIR + '/' + '../data/live'


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_by_name = dict(
    development=DevelopmentConfig,
    production=ProductionConfig
)

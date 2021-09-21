from enum import Enum


class SourceEnum(Enum):
    SCOTLAND = 'scotland'


class DataTypeEnum(Enum):
    MODEL = 'model'
    ANALYTICS = 'analytics'


class ModelEnum(Enum):
    IC = 'ic'
    ONE_KM2 = '1km2'
    LHSTM = 'lhstm'
    CT = 'c&t'


class AnalyticsEnum(Enum):
    SIMILARITY = 'similarity'
    UNCERTAINTY = 'uncertainty'


class DataNode:
    def __init__(self,
                 url_prefix: str,
                 endpoint: str,
                 header: str,
                 description: str,
                 type: str = None,
                 type_val: str = None,
                 source: str = None) -> None:
        self.endpoint = endpoint
        self.description = description
        self.header = header
        self.url_prefix = url_prefix
        self.type = type
        self.type_val = type_val
        self.source = source

    @staticmethod
    def deserialize(obj):
        return DataNode(endpoint=obj.get('endpoint'),
                        url_prefix=obj.get('url_prefix'),
                        header=obj.get('header'),
                        description=obj.get('description'),
                        type=obj.get('type'),
                        type_val=obj.get('type_val'),
                        source=obj.get('source'))

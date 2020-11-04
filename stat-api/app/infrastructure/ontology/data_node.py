from enum import Enum
from typing import Union


class DataTypeEnum(Enum):
    MODEL = 'model'
    ANALYTICS = 'analytics'


class SourceEnum(Enum):
    SCOTLAND = 'scotland'


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
                 endpoint: str,
                 header: str,
                 description: str,
                 url_prefix: str,
                 type: DataTypeEnum = None,
                 type_val: Union[ModelEnum, AnalyticsEnum] = None,
                 source: SourceEnum = None) -> None:
        self.label = 'Data'
        self.endpoint = endpoint
        self.description = description
        self.header = header
        self.url_prefix = url_prefix
        self.type = type
        self.type_val = type_val
        self.source = source

    @staticmethod
    def deserialize(json_obj):
        return DataNode(endpoint=json_obj.get('endpoint'),
                        url_prefix=json_obj.get('url_prefix'),
                        header=json_obj.get('header'),
                        description=json_obj.get('description'),
                        type=json_obj.get('type'),
                        type_val=json_obj.get('type_val'),
                        source=json_obj.get('source'))

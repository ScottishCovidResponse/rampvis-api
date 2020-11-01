from typing import Union
from .analytics_enum import AnalyticsEnum
from .data_type_enum import DataTypeEnum
from .model_enum import ModelEnum
from .source_enum import SourceEnum


class DataNode:
    def __init__(self,
                 endpoint: str,
                 header: str,
                 description: str,
                 source: SourceEnum,
                 type: DataTypeEnum = None,
                 type_name: Union[ModelEnum, AnalyticsEnum] = None) -> None:

        self.endpoint = endpoint
        self.description = description
        self.header = header
        self.type = type
        self.type_name = type_name
        self.source = source

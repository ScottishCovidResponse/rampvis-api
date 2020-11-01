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
                 data_type: DataTypeEnum = None,
                 type_val: Union[ModelEnum, AnalyticsEnum] = None) -> None:

        self.endpoint = endpoint
        self.description = description
        self.header = header
        self.data_type = data_type
        self.type_val = type_val
        self.source = source

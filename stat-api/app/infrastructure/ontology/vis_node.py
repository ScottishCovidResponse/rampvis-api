from enum import Enum


class VisTypeEnum(Enum):
    DASHBOARD = 'dashboard'
    PLOT = 'plot'


class VisNode:
    def __init__(self, name: str, description: str, vis_type: str) -> None:
        self.name = name
        self.description = description
        self.vis_type = vis_type

    @staticmethod
    def deserialize(obj):
        return VisNode(name=obj.get('name'), description=obj.get('description'), vis_type=obj.get('vis_type'))

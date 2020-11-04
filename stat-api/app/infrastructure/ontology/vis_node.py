from enum import Enum


class VisTypeEnum(Enum):
    DASHBOARD = 'dashboard'
    PLOT = 'plot'


class VisNodeDto:
    def __init__(self,
                 name: str,
                 description: str,
                 vis_type: VisTypeEnum = None,
                 ) -> None:
        self.label = 'Vis'
        self.name = name
        self.description = description
        self.vis_type = vis_type

from pydantic import BaseModel
from typing import Optional

class PropagateDataQueryModel(BaseModel):
    visId: str
    mustKeys: list
    shouldKeys: list
    filterKeys: list
    mustNotKeys: Optional[list]
    minimumShouldMatch: int
    alpha: float
    beta: float

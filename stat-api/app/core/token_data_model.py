from pydantic import BaseModel
from typing import Optional

class TokenDataModel(BaseModel):
    userid: Optional[str] = None
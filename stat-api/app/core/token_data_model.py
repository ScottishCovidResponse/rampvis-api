from pydantic import BaseModel
from typing import Optional

class TokenDataModel(BaseModel):
    user_id: Optional[str] = None
from pydantic import BaseModel


class TokenModel(BaseModel):
    access_token: str
    token_type: str

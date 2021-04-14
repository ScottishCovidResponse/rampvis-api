import os
from loguru import logger
import jwt
from functools import wraps
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm


from app.core.settings import GLOBAL_CONFIG_OBJ, RSA_PUB_KEY
from app.core.token_data_model import TokenDataModel

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def validate_user_token(token: str = Depends(oauth2_scheme)):

    try:
        with open(RSA_PUB_KEY, "rb") as key_file:
            public_key = serialization.load_pem_public_key(
                key_file.read(), backend=default_backend()
            )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Public key configuration error",
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, public_key)

        userid: str = payload.get("id")
        if userid is None:
            raise credentials_exception
        token_data = TokenDataModel(userid=userid)

    except Exception as e:
        logger.error(f"{e}")
        raise credentials_exception

    #
    # TODO: check in the database
    #
    # user = get_user(fake_users_db, username=token_data.username)
    # if user is None:
    #    logger.error(f'{user}')
    #    raise credentials_exception
    # return user

    return True

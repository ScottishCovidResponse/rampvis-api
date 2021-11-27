from loguru import logger
import jwt
from datetime import datetime, timedelta
from typing import Optional
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.settings import RSA_PUB_KEY, RSA_PVT_KEY
from app.core.token_data_model import TokenDataModel

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def authenticate_user(username: str, password: str):
    # TODO: Get user form database and check password
    user = {
        "id": "abcd1234567890",
        "role": "admin",
    }
    return user


def get_user(id: str):
    # TODO: Get user form database and check role is admin
    user = {
        "id": "abcd1234567890",
        "role": "admin",
    }
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})

    try:
        with open(RSA_PVT_KEY, "rb") as key_file:
            pvt_key = serialization.load_pem_private_key(
                key_file.read(), backend=default_backend(), password=None
            )

    except Exception as e:
        logger.error(f"{e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"{e}",
        )

    encoded_jwt = jwt.encode(to_encode, pvt_key, algorithm="RS256")
    return encoded_jwt


async def validate_user_token(token: str = Depends(oauth2_scheme)):

    try:
        with open(RSA_PUB_KEY, "rb") as key_file:
            public_key = serialization.load_pem_public_key(
                key_file.read(), backend=default_backend()
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Public key error",
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, public_key)

        user_id: str = payload.get("id")
        if user_id is None:
            raise credentials_exception
        token_data = TokenDataModel(id=user_id)

    except Exception as e:
        logger.error(f"{e}")
        raise credentials_exception

    user = get_user(id=token_data.user_id)
    if user is None:
        logger.error(f"{user}")
        raise credentials_exception

    return user

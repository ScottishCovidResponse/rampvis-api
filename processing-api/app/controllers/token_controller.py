from loguru import logger
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.utils.jwt_service import create_access_token, authenticate_user
from app.core.token_model import TokenModel


ACCESS_TOKEN_EXPIRE_MINUTES = 30
token_controller = APIRouter()


@token_controller.post("/", response_model=TokenModel)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.debug(f"user = {form_data.username}")

    user = authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data=user, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

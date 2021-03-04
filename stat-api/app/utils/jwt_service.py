import os
from flask import current_app, request, jsonify
import jwt
from functools import wraps
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization

from .errors import APIConfigError, APIWrongAuthTokenError


def validate_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        print('validate_token')

        try:
            config = current_app.config
            pub_key = config.get('RSA_PUB_KEY')
            # Load the public key
            with open(pub_key, 'rb') as key_file:
                public_key = serialization.load_pem_public_key(
                    key_file.read(),
                    backend=default_backend()
                )

        except Exception as e:
            raise APIConfigError()

        try:
            bearer_token = request.headers.get('Authorization')
        except:
            raise APIAuthTokenMissingError()

        try:
            token = bearer_token.split(' ')[1]
            jwt.decode(token, public_key)
        except:
            raise APIWrongAuthTokenError()

        return f(*args, **kwargs)

    return decorated

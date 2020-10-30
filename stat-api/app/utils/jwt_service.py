import os
from flask import current_app, request, jsonify
import jwt
from functools import wraps
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization

config = current_app.config


def validate_token(f):

    @wraps(f)
    def decorated(*args, **kwargs):
        pub_key = config.get('RSA_PUB_KEY')

        # Load the public key
        with open(pub_key, "rb") as key_file:
            public_key = serialization.load_pem_public_key(
                key_file.read(),
                backend=default_backend()
            )

        bearer_token = request.headers.get('Authorization')
        if not bearer_token:
            return jsonify({'message': 'Access denied'}), 403

        token = bearer_token.split(' ')[1]
        if not token:
            return jsonify({'message': 'Access denied'}), 403

        if not token and not bearer_token:
            return jsonify({'message': 'Access denied'}), 403

        try:
            jwt.decode(token, public_key)
        except:
            return jsonify({'message': 'Access denied'}), 403

        return f(*args, **kwargs)

    return decorated
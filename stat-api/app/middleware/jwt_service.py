import os
from flask import current_app, request, jsonify
import jwt
from functools import wraps
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization


# Will be assigned later for access outside of context
root_path = None
# Public key for JWT
RSA_PUB_KEY = '../../data-api/config/keys/jwtRS256.key.pub'


def validate_token(f):
    print('token_required:')

    @wraps(f)
    def decorated(*args, **kwargs):
        global root_path
        root_path = current_app.root_path
        pub_key = os.path.join(root_path, RSA_PUB_KEY)

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

        # print(f'received token = {token}')
        if not token and not bearer_token:
            return jsonify({'message': 'Access denied'}), 403

        try:
            decoded = jwt.decode(token, public_key)
            # print(f'decoded with public key : {decoded}')
        except:
            return jsonify({'message': 'Access denied'}), 403

        return f(*args, **kwargs)

    return decorated

## Based on auth.py from Udacity FSND Project 3
import os
import json
from functools import wraps
from urllib.request import urlopen

from flask import request
from jose import jwt

AUTH0_DOMAIN = os.environ.get('AUTH0_DOMAIN')
ALGORITHMS = os.environ.get('ALGORITHMS')
API_AUDIENCE = os.environ.get('API_AUDIENCE')

## AuthError Exception
"""
AuthError Exception
A standardized way to communicate auth failure modes
"""
class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code


## This function takes an authorization header and returns the JWT
def get_token_auth_header():
    auth = request.headers.get('Authorization', None)
    if auth is None:
        raise AuthError({
            'code': 'authorization_header_missing',
            'description': 'Authorization header is expected.'
        }, 401)

    parts = auth.split()
    if parts[0].lower() != 'bearer':
        raise AuthError({
            'code': 'invalid_header',
            'description': 'Authorization header must start with "Bearer".'
        }, 401)
    elif len(parts) == 1:
        raise AuthError({
            'code': 'invalid_header',
            'description': 'Token not found.'
        }, 401)
    elif len(parts) > 2:
        raise AuthError({
            'code': 'invalid_header',
            'description': 'Authorization header must be bearer token.'
        }, 401)

    token = parts[1]
    return token

## This function takes a JWT, verifies and decrypts it
def verify_decode_jwt(token):
    jsonurl = urlopen(f'https://{AUTH0_DOMAIN}/.well-known/jwks.json')
    jwks = json.loads(jsonurl.read())
    try:
        unverified_header = jwt.get_unverified_header(token)
    except:
        raise AuthError({
            'code': 'invalid_token',
            'description': 'Provided token is invalid.'
        }, 401)
    rsa_key = {}
    if 'kid' not in unverified_header:
        raise AuthError({
            'code': 'invalid_header',
            'description': 'Authorization malformed.'
        }, 401)

    for key in jwks['keys']:
        if key['kid'] == unverified_header['kid']:
            rsa_key = {
                'kty': key['kty'],
                'kid': key['kid'],
                'use': key['use'],
                'n': key['n'],
                'e': key['e']
            }

    if rsa_key:
        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=API_AUDIENCE,
                issuer='https://' + AUTH0_DOMAIN + '/'
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise AuthError({
                'code': 'token_expired',
                'description': 'Token expired.'
            }, 401)
        except jwt.JWTClaimsError:
            raise AuthError({
                'code': 'invalid_claims',
                'description': 'Incorrect claims. Please, check the audience and issuer.'
            }, 401)
        except Exception:
            raise AuthError({
                'code': 'invalid_header',
                'description': 'Unable to parse authentication token.'
            }, 400)

    raise AuthError({
        'code': 'invalid_header',
        'description': 'Unable to find the appropriate key.'
    }, 400)

## This function takes a permission and a payload, and checks if the payload contains the necessary permission
## If successful, the function returns the Auth0 user id
def check_permissions(permission, payload):
    if 'permissions' not in payload:
        raise AuthError({
            'code': 'invalid_payload',
            'description': 'Payload does not contain a permissions list.'
        }, 401)

    if permission not in payload['permissions']:
        raise AuthError({
            'code': 'unauthorized',
            'description': 'Necessary permission is not given.'
        }, 403)

    return payload['sub']

def requires_auth(permission=''):
    def requires_auth_decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token = get_token_auth_header()
            payload = verify_decode_jwt(token)
            user_id = check_permissions(permission, payload)

            # Pass the user id as a parameter to the function
            return f(user_id, *args, **kwargs)
        return wrapper
    return requires_auth_decorator
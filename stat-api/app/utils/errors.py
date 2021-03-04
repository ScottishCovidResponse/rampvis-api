from flask import jsonify
from enum import Enum


class ErrorCodes(Enum):
    AUTHENTICATION_TOKEN_MISSING = 1
    WRONG_AUTHENTICATION_TOKEN = 2
    ACCESS_CONTROL = 3
    SERVER_EXCEPTION = 4
    INVALID_QUERY_PARAMETERS = 5
    API_CONFIGURATION_ERROR = 6


class APIError(Exception):
    '''
    All custom API Exceptions
    '''
    pass


class APIAuthTokenMissingError(APIError):
    '''
    Custom authentication error class.
    '''
    message = 'Authentication token missing'
    status = 403
    code = ErrorCodes.AUTHENTICATION_TOKEN_MISSING


class APIWrongAuthTokenError(APIError):
    '''
    Custom authentication error class.
    '''
    message = 'Wrong authentication token'
    status = 403
    code = ErrorCodes.WRONG_AUTHENTICATION_TOKEN


class APIUnauthorizedError(APIError):
    message = 'Unauthorized error'
    status = 403
    code = ErrorCodes.ACCESS_CONTROL


class APIInternalServerError(APIError):
    message = 'Internal server error'
    status = 500
    code = ErrorCodes.SERVER_EXCEPTION


class APIInvalidQueryParamsError(APIError):
    message = 'Internal server error'
    status = 500
    code = ErrorCodes.INVALID_QUERY_PARAMETERS


class APIConfigError(APIError):
    message = 'Configuration error'
    status = 500
    code = ErrorCodes.API_CONFIGURATION_ERROR


def initialize_error_handler(app):
    @app.errorhandler(APIError)
    def handle_exception(err):
        '''
        Return custom JSON when APIError or its children are raised
        '''
        response = {
            'message': err.message,
            'status': err.status,
            'code': err.code.name
        }

        if len(err.args) > 0:
            response['message'] = err.args[0]
        
        # Add some logging so that we can monitor different types of errors
        app.logger.error(f'{response}')

        return jsonify(response), err.status

    @app.errorhandler(500)
    def handle_exception(err):
        app.logger.error(f'Unknown Exception: {str(err)}')
        app.logger.debug(''.join(traceback.format_exception(
            etype=type(err), value=err, tb=err.__traceback__)))
        response = {
            'message': 'Internal server error',
            'status': 500,
            'code': ErrorCodes.SERVER_EXCEPTION
        }
        return jsonify(response), 500

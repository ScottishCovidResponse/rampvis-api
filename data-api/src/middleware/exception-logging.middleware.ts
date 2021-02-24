import { Request, Response } from 'express';
import { HttpException } from '../exceptions/exception';
import { logger } from '../utils/logger';
import { LogError } from '../exceptions/log.error';
import { ERROR_CODES } from '../exceptions/error.codes';

function exceptionLoggingMiddleware(error: HttpException, req: Request, res: Response, next: () => void) {
    let customError = error as LogError;

    customError.protocol = req.protocol;
    customError.hostname = req.hostname;
    customError.path = req.path;
    customError.originalUrl = req.originalUrl;
    customError.subdomains = req.subdomains;
    customError.method = req.method;
    customError.ip = req.ip;
    customError.ips = req.ips;
    customError.userAgent = req.header('user-agent');

    if (process.env.NODE_ENV === 'development') {
        console.error('exceptionLoggingMiddleware: error = ', error);
    } else {
        console.log(customError)
    }

    // Hide stack from client for security reasons
    const handled: boolean = Object.values(ERROR_CODES).find((v) => v.toString() == customError.code) != null;
    const status: number = customError.status || 500;
    const message: string = (customError.code && handled && customError.message) || 'Something went wrong';
    const code: string = customError.code;
    const data: object | undefined = customError.data;

    res.status(status).send({ message, status, code, data });
}

export { exceptionLoggingMiddleware };

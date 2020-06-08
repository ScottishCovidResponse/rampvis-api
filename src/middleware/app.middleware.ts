import bodyParser from 'body-parser';
import compression from 'compression';
import config from 'config';
import cors from 'cors';
import {Application} from 'express';
import morgan from 'morgan';

import {logger, loggerStream} from '../utils/logger';


function appMiddleware(app: Application) {

    logger.info('Initialize third party middlewares.');

    app.use(morgan('combined', {
        stream: loggerStream,  // custom logger
    }));
    app.use(morgan('dev')); // show in console.log

    app.use(compression());

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false,
    }));

    // CORS
    const allowedOrigins: string[] = config.get('allowOrigins');
    app.use(cors({
        credentials: false,
        origin: (origin, callback) => {
            logger.debug('appMiddleware: cross origin = ' + origin);

            // allow requests with no origin, e.g., like mobile apps or curl requests
            if (!origin) {
                logger.error('appMiddleware: cross origin = ' + origin + ' - allowed');
                return callback(null, true);
            }
            if (allowedOrigins.indexOf(origin) !== -1) {
                logger.error('appMiddleware: cross origin = ' + origin + ' - allowed');
                return callback(null, true);
            } else {
                logger.error('appMiddleware: cross origin = ' + origin + ' - denied. allowedOrigins = ' + allowedOrigins);
                const msg = 'The CORS policy for this site does not allow access from the specified origin.';
                return callback(new Error(msg), false);
            }
        },
    }));

}

export {appMiddleware};

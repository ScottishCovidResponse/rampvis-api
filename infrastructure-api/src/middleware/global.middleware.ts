import bodyParser from 'body-parser';
import compression from 'compression';
import config from 'config';
import cors from 'cors';
import morgan from 'morgan';
import * as express from 'express';
import session from 'express-session';
import passport from 'passport';

import { logger, loggerStream } from '../utils/logger';
import { configureGithubStrategy } from './passport-github';
import { UserService } from '../services/user.service';
import { DIContainer } from '../services/config/inversify.config';
import { TYPES } from '../services/config/types';
import { generateIsOriginAllowed } from './generateIsOriginAllowed';
import { IUser } from '../infrastructure/user/user.interface';

const isOriginAllowed = generateIsOriginAllowed(config.get('allowOriginRegex'), logger);

function GlobalMiddleware(app: express.Application) {
    logger.info('Initialize global middleware.');

    app.use(
        morgan('combined', {
            stream: loggerStream, // custom logger
        })
    );
    app.use(morgan('dev')); // show in console.log

    app.use(compression());

    app.use(bodyParser.json());
    app.use(
        bodyParser.urlencoded({
            extended: true,
        })
    );

    app.use(
        express.urlencoded({
            extended: true,
        })
    );

    // passport and related
    app.use(
        session({
            secret: config.get('session.secret'),
            resave: true,
            saveUninitialized: true,
        })
    );
    app.use(passport.initialize({ userProperty: 'currentUser' }));
    app.use(passport.session());
    configureGithubStrategy();

    passport.serializeUser((user: any, done) => {
        done(null, user._id);
    });

    // extract the userId from session
    passport.deserializeUser(async (id: string, done) => {
        const userService: UserService = DIContainer.get<UserService>(TYPES.UserService);
        const user: IUser = await userService.get(id);
        done(null, user);
    });

    // CORS
    app.use(
        cors({
            credentials: false,
            origin: (origin, callback) => {
                logger.debug(`GlobalMiddleware: origin = ${origin}`);

                // Allow all
                // return callback(null, true);

                if (isOriginAllowed(origin)) {
                    logger.debug(`GlobalMiddleware: origin = ${origin}, allowed`);
                    return callback(null, true);
                } else {
                    logger.debug(`GlobalMiddleware: origin = ${origin}, denied.`);
                    const msg = 'The CORS policy for this site does not allow access from the specified origin.';
                    return callback(new Error(msg), false);
                }
            },
        })
    );
}

export { GlobalMiddleware };

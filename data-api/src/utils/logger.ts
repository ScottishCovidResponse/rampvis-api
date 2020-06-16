import {Logger, LoggerOptions, transports, format, createLogger} from 'winston';
import AppRoot from 'app-root-path';

// log level
const level = process.env.NODE_ENV === 'production' ? 'error' : 'debug';

// Ignore log messages if they have { private: true }
const ignorePrivate = format((info) => {
    if (info.private) {
        return false;
    }
    return info;
});

// define the custom settings for each transport (file, console, elasticsearch)
const loggerOptions: LoggerOptions = {
    exitOnError: false,
    level: level,
    format: format.combine(
        ignorePrivate(),
        format.prettyPrint(),
        format.colorize(),
    ),

    transports: [
        new transports.Console({
            level: level,
            silent: false,
        }),
        new transports.File({
            level: level,
            filename: `${AppRoot}/logs/log.log`,
            zippedArchive: true,
            maxFiles: 5,
            maxsize: 5242880, // 5MB
        }),

        // new Sentry({
        //     level: 'error',
        //     config: {
        //         dsn: config.get('sentry.dsn'),
        //         environment: process.env.NODE_ENV
        //     }
        // })

        // new WinstonElasticsearch({
        //     level: level,
        //     client: new elasticsearch.Client({
        //         host: config.elasticsearch.url,
        //     }),
        // })
    ],
} as any;

const logger: Logger = createLogger(loggerOptions);

const loggerStream = {
    write: (message: string) => {
        logger.info(message);
    },
};

if (process.env.NODE_ENV !== 'production') {
    logger.debug('Logging initialized at debug level');
}

export {logger, loggerStream};

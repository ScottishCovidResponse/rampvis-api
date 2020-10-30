import os from 'os';
import config from 'config';
import express from 'express';
import {Application} from 'express-serve-static-core';
import {Container} from 'inversify';
import {InversifyExpressServer} from 'inversify-express-utils';

import {DbClient, getDatabaseClient} from './infrastructure/db/mongodb.connection';
import {GlobalMiddleware} from './middleware/global.middleware';
import {exceptionLoggingMiddleware} from './middleware/exception-logging.middleware';
import {configureAutoMapper} from './services/config/automapper.config';
import {TYPES} from './services/config/types';
import {logger} from './utils/logger';
import {DIContainer} from './services/config/inversify.config';
import './controllers/controller.module';
import {SearchService} from "./services/search.service";

export class App {
    public app!: express.Application;

    constructor() {
    }

    public async init() {

        process.env['UV_THREADPOOL_SIZE'] = os.cpus().length.toString();    
        logger.info(`App: init: UV_THREADPOOL_SIZE = ${JSON.stringify(process.env.UV_THREADPOOL_SIZE)}, CPUs = ${os.cpus().length}`);

        let container: Container = DIContainer;

        await App.initDatabase(container);
        await App.createDbIndexes(container);

        const server = new InversifyExpressServer(container, null, {rootPath: config.get('apiUrl')});
        this.app = server.setConfig((application: express.Application) => {
            App.initGlobalMiddleware(application);
            App.initAutoMapper();
        })
            .setErrorConfig((application: express.Application) => {
                App.initExceptionLoggingMiddleware(application);
            })
            .build();
    }

    private static async initDatabase(container: Container) {
        const url: string = config.get('mongodb.url');

        try {
            const dbClient = await getDatabaseClient(url);
            container.bind<DbClient>(TYPES.DbClient).toConstantValue(dbClient);
            logger.info(`Connected to MongoDB, url: ${url}`);
        } catch (err) {
            logger.error(`Error connecting to MongoDB, url: ${url}`);
            process.exit();
        }
    }

    private static async createDbIndexes(container: Container) {
        try {
            const searchService: SearchService = container.get<SearchService>(TYPES.SearchService);
            await searchService.createTextIndex({ title: "text", description: "text" });
        } catch (err) {
            logger.error(`Error creating indexes, error: ${err}`);
            process.exit();
        }
    }

    private static initAutoMapper() {
        configureAutoMapper();
    }

    private static initExceptionLoggingMiddleware(app: Application) {
        logger.info('Initialize exception logging middleware.');
        app.use(exceptionLoggingMiddleware);
    }

    private static initGlobalMiddleware(app: Application) {
        logger.info('Initialize global middleware.');
        GlobalMiddleware(app);
    }

    public listen() {
        this.app.listen(process.env.PORT || 3000, () => {
            logger.info(`App listening on the port ${process.env.PORT}`);
        });
    }

}

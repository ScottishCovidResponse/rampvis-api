import config from 'config';
import express from 'express';
import {Application} from 'express-serve-static-core';
import {Container} from 'inversify';
import {InversifyExpressServer} from 'inversify-express-utils';

import {DbClient, getDatabaseClient} from './infrastructure/db/mongodb.connection';
import {appMiddleware} from './middleware/app.middleware';
import {exceptionLoggingMiddleware} from './middleware/custom.middleware';
import {configureAutoMapper} from './services/config/automapper.config';
import {DIContainer} from './services/config/inversify.config';
import {TYPES} from './services/config/types';
import {logger} from './utils/logger';
import {DbSeeder} from './utils/seeder';

// declare metadata by @controller annotation
import './controllers/controller.module';

export class App {

    //
    // Static private initialization methods
    //
    private static initErrorHandling(app: Application) {
        logger.info('Initialize error handling middleware.');
        app.use(exceptionLoggingMiddleware);
    }

    private static initMiddleware(app: Application) {
        logger.info('Initialize middleware.');
        appMiddleware(app);
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
            // const xService: IXService = container.get<IXService>(TYPES.IXService);
            // await xService.createIndex({first: 1}, config.get('mongodb.indexes.tracking_day') as number);
        } catch (err) {
            logger.error(`Error creating indexes, error: ${err}`);
            process.exit();
        }
    }

    private static async seedDatabase() {
        logger.info('Initialize database seeder.');
        const dbSeeder = new DbSeeder();
        await dbSeeder.initDatabase();
    }

    private static initAutoMapper() {
        configureAutoMapper();
    }

    //
    // Public methods
    //
    public app!: express.Application;

    constructor() {
        //
    }

    public async init() {
        // set up container
        const container = DIContainer;

        await App.initDatabase(container);
        // App.initPushService(container);
        await App.createDbIndexes(container);

        const server = new InversifyExpressServer(container, null, {rootPath: config.get('apiUrl')});
        this.app = server.setConfig((application: express.Application) => {
            App.initMiddleware(application);
            App.initAutoMapper();
        })
            .setErrorConfig((application: express.Application) => {
                App.initErrorHandling(application);
            })
            .build();

        if (process.argv.includes('seed')) {
            await App.seedDatabase();
        }
    }

    public listen() {
        this.app.listen(process.env.PORT || 3000, () => {
            logger.info(`App listening on the port ${process.env.PORT}`);
        });
    }

}

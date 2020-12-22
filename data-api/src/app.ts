import os from 'os';
import config from 'config';
import express from 'express';
import { Application } from 'express-serve-static-core';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';

import { DbClient, getDatabaseClient } from './infrastructure/db/mongodb.connection';
import { GlobalMiddleware } from './middleware/global.middleware';
import { exceptionLoggingMiddleware } from './middleware/exception-logging.middleware';
import { configureAutoMapper } from './services/config/automapper.config';
import { TYPES } from './services/config/types';
import { logger } from './utils/logger';
import { DIContainer } from './services/config/inversify.config';
import './controllers/controller.module';
import { SearchServiceV05 } from './services/search.service.v0.5';
import { SearchClient, getSearchClient } from './infrastructure/db/elasticsearch.connection';
import { OntoDataService } from './services/onto-data.service';
import { OntoDataSearchService } from './services/onto-data-search.service';

export class App {
    public app!: express.Application;

    constructor() {}

    public async init() {
        process.env['UV_THREADPOOL_SIZE'] = os.cpus().length.toString();
        logger.info(`App: init: UV_THREADPOOL_SIZE = ${JSON.stringify(process.env.UV_THREADPOOL_SIZE)}, CPUs = ${os.cpus().length}`);

        let container: Container = DIContainer;

        await App.initDatabase(container);
        await App.createDbSearchIndexes(container);

        await App.initElasticsearch(container);
        await App.createSearchIndexes(container);
        await App.putSearchMappings(container);

        const server = new InversifyExpressServer(container, null, { rootPath: config.get('apiUrl') });
        this.app = server
            .setConfig((application: express.Application) => {
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

    private static async createDbSearchIndexes(container: Container) {
        try {
            // v0.5
            // Manually create pages collection from v0.5 pages.json file
            const searchServiceV05: SearchServiceV05 = container.get<SearchServiceV05>(TYPES.SearchServiceV05);
            await searchServiceV05.createTextIndex({ title: 'text', description: 'text' });

            const ontoDataService: OntoDataService = container.get<OntoDataService>(TYPES.OntoDataService);
            await ontoDataService.createTextIndex({ productDesc: 'text', streamDesc: 'text' });

        } catch (err) {
            logger.error(`Error creating indexes, error= ${JSON.stringify(err)}`);
            process.exit();
        }
    }

    private static async initElasticsearch(container: Container) {
        const host: string = config.get('es.host');
        try {
            const searchClient = await getSearchClient(host);
            container.bind<SearchClient>(TYPES.SearchClient).toConstantValue(searchClient);
            logger.info(`Connected to Elasticsearch, host: ${host}`);
        } catch (err) {
            logger.error(`Error connecting to Elasticsearch, host: ${host}`);
            process.exit();
        }
    }

    private static async createSearchIndexes(container: Container) {
        try {
            const ontoPageSearchService: OntoDataSearchService = container.get<OntoDataSearchService>(TYPES.OntoDataSearchService);
            await ontoPageSearchService.createIndexes();
            logger.info(`Created search indexes.`);
        } catch (err) {
            logger.error(`Error creating indexes, error: ${err}`);
            process.exit();
        }
    }

    private static async putSearchMappings(container: Container) {
        try {
            const ontoPageSearchService: OntoDataSearchService = container.get<OntoDataSearchService>(TYPES.OntoDataSearchService);
            await ontoPageSearchService.putMapping();
            logger.info(`Created search mappings.`);
        } catch (err) {
            logger.error(`Error creating mappings, error: ${err}`);
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

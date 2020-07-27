import config from 'config';
import {inject} from 'inversify';
import {provide} from 'inversify-binding-decorators';
import 'reflect-metadata';

import {DbClient} from '../infrastructure/db/mongodb.connection';
import {logger} from '../utils/logger';
import {TYPES} from './config/types';
import {DataService} from './data.service';

@provide(TYPES.ThumbnailService)
export class ThumbnailService extends DataService<any> {
    public constructor(
        @inject(TYPES.DbClient) dbClient: DbClient,
    ) {
        super(
            dbClient,
            config.get('mongodb.db'),
            config.get('mongodb.collection.thumbnails'),
        );
    }

    public async saveThumbnail(thumbnail: any): Promise<any> {
        logger.debug('ThumbnailService: saveThumbnail: thumbnail = ', thumbnail);
        const pageId = thumbnail.originalname.split('.')[0];
        return await this.save( { ...thumbnail, pageId} );
    }

    public async getThumbnail(pageId: string): Promise<any> {
        return await this.get({pageId});
    }

    public async getAllThumbnails(): Promise<any[]> {
         return await this.getAll();
    }

}
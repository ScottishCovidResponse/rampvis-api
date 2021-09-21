import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
import 'reflect-metadata';

import { IThumbnail } from '../infrastructure/thumbnail/thumbnail.interface';
import { DbClient } from '../infrastructure/db/mongodb.connection';
import { logger } from '../utils/logger';
import { TYPES } from './config/types';
import { DataService } from './data.service';
import { FilterQuery, FindAndModifyWriteOpResultObject } from 'mongodb';
import { MAPPING_TYPES } from './config/automapper.config';

@provide(TYPES.ThumbnailService)
export class ThumbnailService extends DataService<any> {
    public constructor(@inject(TYPES.DbClient) dbClient: DbClient) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.thumbnails'));
    }

    public async saveThumbnail(thumbnail: any): Promise<IThumbnail> {
        logger.debug('ThumbnailService: saveThumbnail: thumbnail = ', thumbnail);
        const pageId = thumbnail.originalname.split('.')[0];
        if (!pageId) {
            return undefined as any;
        }
        const exists = await this.get({ pageId });
        if (exists) {
            return await this.updateAndGet(exists._id.toString(), thumbnail);
        } else {
            return await this.create({ ...thumbnail, pageId });
        }
    }

    public async getThumbnail(pageId: string): Promise<IThumbnail> {
        return await this.get({ pageId });
    }

    public async getAllThumbnails(): Promise<IThumbnail[]> {
        return await this.getAll();
    }

    async deleteThumbnail(pageId: string): Promise<IThumbnail> {
        const res: FindAndModifyWriteOpResultObject<IThumbnail> = await this.getDbCollection().findOneAndDelete({
            pageId: pageId,
        } as FilterQuery<IThumbnail>);
        return automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, res.value);
    }
}

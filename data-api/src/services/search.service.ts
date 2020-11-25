import { provide } from 'inversify-binding-decorators';

import { TYPES } from './config/types';
import { DataService } from './data.service';
import { IPage } from '../infrastructure/search/page.interface';
import { inject } from 'inversify';
import { DbClient } from '../infrastructure/db/mongodb.connection';
import config from 'config';

@provide(TYPES.SearchService)
export class SearchService extends DataService<IPage> {
    public constructor(@inject(TYPES.DbClient) dbClient: DbClient) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.pages'));
    }

    async search(queryStr: string): Promise<IPage[]> {
        let pipeline = [
            {
                $match: {
                    $text: {
                        $search: queryStr,
                    },
                },
            },
            { $sort: { score: { $meta: 'textScore' } } },
        ];
        return this.getDbCollection().aggregate(pipeline).toArray();
    }
}

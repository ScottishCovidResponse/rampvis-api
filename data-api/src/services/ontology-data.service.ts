import { ObjectId } from 'bson';
import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { TYPES } from './config/types';
import { DataService } from './data.service';
import { IOntoData } from '../infrastructure/onto-data/onto-data.interface';
import { OntoDataVm } from '../infrastructure/onto-data/onto-data.vm';
import { IdDoesNotExist } from '../exceptions/exception';
import { logger } from '../utils/logger';

@provide(TYPES.OntologyDataService)
export class OntologyDataService extends DataService<IOntoData> {
    public constructor(@inject(TYPES.DbClient) dbClient: DbClient) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.ontology_data'));
    }

    public async getMultiple(ids: string[]): Promise<IOntoData[]> {
        return await this.getAll({ _id: { $in: ids.map((id) => new ObjectId(id)) } });
    }

    public async createData(dataVm: OntoDataVm): Promise<IOntoData> {
        let data: IOntoData = await this.get({ endpoint: dataVm.endpoint, url: dataVm.url });
        if (data) return data;

        data = {
            _id: new ObjectId(),
            url: dataVm.url,
            endpoint: dataVm.endpoint,
            queryParams: dataVm?.queryParams,
            description: dataVm.description,
            source: dataVm?.source,
            model: dataVm?.model,
            analytics: dataVm?.analytics,
        };
        return await this.create(data);
    }

    public async updateData(dataId: string, dataVm: OntoDataVm): Promise<IOntoData> {
        let data: IOntoData = await this.get(dataId);
        if (!data) throw new IdDoesNotExist(dataId);

        const { id, ...updateDataVm } = dataVm;
        return await this.updateAndGet(dataId, updateDataVm as IOntoData);
    }
}

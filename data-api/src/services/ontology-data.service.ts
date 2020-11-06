import { ObjectId } from 'bson';
import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { TYPES } from './config/types';
import { DataService } from './data.service';
import { IData } from '../infrastructure/ontology/data.interface';
import { DataVm } from '../infrastructure/ontology/data.vm';
import { IdDoesNotExist } from '../exceptions/exception';
import { logger } from '../utils/logger';

@provide(TYPES.OntologyDataService)
export class OntologyDataService extends DataService<IData> {
    public constructor(@inject(TYPES.DbClient) dbClient: DbClient) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.ontology_data'));
    }

    public async getMultiple(ids: string[]): Promise<IData[]> {
        return await this.getAll({ _id: { $in: ids.map((id) => new ObjectId(id)) } });
    }

    public async createData(dataVm: DataVm): Promise<IData> {
        let data: IData = await this.get({ endpoint: dataVm.endpoint, url: dataVm.url });
        if (data) return data;

         data = {
            _id: new ObjectId(),
            url: dataVm.url,
            endpoint: dataVm.endpoint,
            query_params: dataVm?.query_params,
            description: dataVm.description,
            source: dataVm?.source,
            model: dataVm?.model,
            analytics: dataVm?.analytics,
        };
        return await this.create(data);
    }

    public async deleteData(dataId: string): Promise<IData> {
        // TODO
        return Promise.resolve(null as any);
    }

    public async updateData(dataId: string, dataVm: DataVm): Promise<IData> {
        let data: IData = await this.get(dataId);
        if (!data) throw new IdDoesNotExist(dataId);

        const { id, ...updateDataVm } = dataVm;
        return await this.updateAndGet(dataId, updateDataVm as IData);
    }
}

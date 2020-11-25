import { ObjectId } from 'bson';
import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { TYPES } from './config/types';
import { DataService } from './data.service';
import { IOntoData } from '../infrastructure/onto-data/onto-data.interface';
import { OntoDataVm } from '../infrastructure/onto-data/onto-data.vm';
import { DuplicateEntry, IdDoesNotExist } from '../exceptions/exception';

@provide(TYPES.OntoDataService)
export class OntoDataService extends DataService<IOntoData> {
    public constructor(@inject(TYPES.DbClient) dbClient: DbClient) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.onto_data'));
    }

    public async getMultiple(ids: string[]): Promise<IOntoData[]> {
        return await this.getAll({ _id: { $in: ids.map((id) => new ObjectId(id)) } });
    }

    public async createData(dataVm: OntoDataVm): Promise<IOntoData> {
        let data: IOntoData = await this.get({ endpoint: dataVm.endpoint, urlCode: dataVm.urlCode });
        if (data) throw new DuplicateEntry(`${dataVm.urlCode}${dataVm.endpoint}`);

        data = {
            _id: new ObjectId(),
            urlCode: dataVm.urlCode,
            endpoint: dataVm.endpoint,
            dataType: dataVm.dataType,
            description: dataVm.description,
            source: dataVm?.source,
            model: dataVm?.model,
            analytics: dataVm?.analytics,
            queryParams: dataVm.queryParams,
        };
        return await this.create(data);
    }

    public async updateData(dataId: string, dataVm: OntoDataVm): Promise<IOntoData> {
        let data: IOntoData = await this.get({ endpoint: dataVm.endpoint, urlCode: dataVm.urlCode });
        if (data && data._id !== dataId) throw new DuplicateEntry(`${dataVm.urlCode}${dataVm.endpoint}`);
        
        data = await this.get(dataId);
        if (!data) throw new IdDoesNotExist(dataId);

        const { id, ...updateDataVm } = dataVm;
        return await this.updateAndGet(dataId, updateDataVm as IOntoData);
    }
}

import { ObjectId } from 'bson';
import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { TYPES } from './config/types';
import { DataService } from './data.service';
import { IOntoVis } from '../infrastructure/ontology/onto-vis.interface';
import { OntoVisVm } from '../infrastructure/ontology/onto-vis.vm';
import { IdDoesNotExist } from '../exceptions/exception';

@provide(TYPES.OntologyVisService)
export class OntologyVisService extends DataService<IOntoVis> {
    public constructor(@inject(TYPES.DbClient) dbClient: DbClient) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.ontology_vis'));
    }

    public async createVis(visVm: OntoVisVm): Promise<IOntoVis> {
        let vis: IOntoVis = await this.get({ function: visVm.function });
        if (vis) return vis;

        vis = {
            _id: new ObjectId(),
            function: visVm.function,
            type: visVm.type,
            description: visVm.description,
        };
        return await this.create(vis);
    }

    public async deleteVis(visId: string): Promise<IOntoVis> {
        // TODO
        return Promise.resolve(null as any);
    }

    public async updateVis(visId: string, visVm: OntoVisVm): Promise<IOntoVis> {
        let vis: IOntoVis = await this.get(visId);
        if (!vis) throw new IdDoesNotExist(visId);

        const updateVis: IOntoVis = {
            function: visVm.function,
            type: visVm.type,
            description: visVm.description,
        } as IOntoVis;
        return await this.updateAndGet(visId, updateVis);
    }
}

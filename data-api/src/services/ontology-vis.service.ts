import { ObjectId } from 'bson';
import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { TYPES } from './config/types';
import { DataService } from './data.service';
import { IVis } from '../infrastructure/ontology/vis.interface';
import { VisVm } from '../infrastructure/ontology/vis.vm';
import { VisIdDoesNotExist } from '../exceptions/exception';

@provide(TYPES.OntologyVisService)
export class OntologyVisService extends DataService<IVis> {
    public constructor(@inject(TYPES.DbClient) dbClient: DbClient) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.ontology_vis'));
    }

    public async getMultiple(ids: string[]): Promise<IVis[]> {
        return await this.getAll({ _id: { $in: ids.map((id) => new ObjectId(id)) } });
    }

    public async createVis(visVm: VisVm): Promise<IVis> {
        let vis: IVis = await this.get({ function: visVm.function });
        if (vis) return vis;

        vis = {
            _id: new ObjectId(),
            function: visVm.function,
            type: visVm.type,
            description: visVm.description,
        };
        return await this.create(vis);
    }

    public async deleteVis(visId: string): Promise<IVis> {
        // TODO
        return Promise.resolve(null as any);
    }

    public async updateVis(visId: string, visVm: VisVm): Promise<IVis> {
        let vis: IVis = await this.get(visId);
        if (!vis) throw new VisIdDoesNotExist(visId);

        const updateVis: IVis = {
            function: visVm.function,
            type: visVm.type,
            description: visVm.description,
        } as IVis;
        return await this.updateAndGet(visId, updateVis);
    }
}

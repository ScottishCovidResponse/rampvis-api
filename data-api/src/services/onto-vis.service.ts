import { ObjectId } from 'bson';
import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { TYPES } from './config/types';
import { DataService } from './data.service';
import { IOntoVis } from '../infrastructure/onto-vis/onto-vis.interface';
import { OntoVisVm } from '../infrastructure/onto-vis/onto-vis.vm';
import { DuplicateEntry, IdDoesNotExist } from '../exceptions/exception';
import { OntoPageService } from './onto-page.service';
import { IOntoPage } from '../infrastructure/onto-page/onto-page.interface';
import { IOntoData } from '../infrastructure/onto-data/onto-data.interface';
import { OntoDataService } from './onto-data.service';

@provide(TYPES.OntoVisService)
export class OntoVisService extends DataService<IOntoVis> {
    public constructor(
        @inject(TYPES.DbClient) dbClient: DbClient,
        @inject(TYPES.OntoPageService) private ontoPageService: OntoPageService,
        @inject(TYPES.OntoDataService) private ontoDataService: OntoDataService,
    ) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.onto_vis'));
    }

    public async createVis(visVm: OntoVisVm): Promise<IOntoVis> {
        let vis: IOntoVis = await this.get({ function: visVm.function });
        if (vis) throw new DuplicateEntry(visVm.function);

        vis = {
            _id: new ObjectId(),
            function: visVm.function,
            type: visVm.type,
            description: visVm.description,
            dataTypes: visVm.dataTypes,
        };
        return await this.create(vis);
    }

    public async updateVis(visId: string, visVm: OntoVisVm): Promise<IOntoVis> {
        let vis: IOntoVis = await this.get({ 'function': visVm.function });
        if (vis && vis._id !== visId) throw new DuplicateEntry(`${visVm.function}`);

        vis = await this.get(visId);
        if (!vis) throw new IdDoesNotExist(visId);

        const updateVis: IOntoVis = {
            function: visVm.function,
            type: visVm.type,
            description: visVm.description,
            dataTypes: visVm.dataTypes,
        } as any;

        return await this.updateAndGet(visId, updateVis);
    }

    public async getExampleDataBindingVisId(visId: string) {
        const ontoPages: IOntoPage[] = await this.ontoPageService.getExamplePagesBindingVisId(visId);
        const ontoData: IOntoData[] = await this.ontoDataService.getMultiple(ontoPages[0].bindings[0].dataIds)
        return ontoData;
    }
}

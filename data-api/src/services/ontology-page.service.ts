import { ObjectId } from 'bson';
import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { TYPES } from './config/types';
import { DataService } from './data.service';
import { IdDoesNotExist } from '../exceptions/exception';
import { IOntoPage } from '../infrastructure/onto-page/onto-page.interface';
import { OntoPageVm } from '../infrastructure/onto-page/onto-page.vm';

@provide(TYPES.OntologyPageService)
export class OntologyPageService extends DataService<IOntoPage> {
    public constructor(
        @inject(TYPES.DbClient) dbClient: DbClient,
    ) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.ontology_page'));
    }

    public async createPage(ontoPageVm: OntoPageVm): Promise<IOntoPage> {
        // TODO
        // let ontoPage: IOntoPage = check if exist based on some condition
        // if (ontoPage) return data;

        // TODO
        // check pageId
        // check dataId, query, & params

        let ontoPage = {
            _id: new ObjectId(),
            title: ontoPageVm.title,
            bindVis: ontoPageVm.bindVis,
            nrows: ontoPageVm.nrows,
        };
        return await this.create(ontoPage);
    }

    public async updatePage(pageId: string, ontoPageVm: OntoPageVm): Promise<IOntoPage> {
        let data: IOntoPage = await this.get(pageId);
        if (!data) throw new IdDoesNotExist(pageId);

        const { id, ...updateDataVm } = ontoPageVm;
        return await this.updateAndGet(pageId, updateDataVm as IOntoPage);
    }
}

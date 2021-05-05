import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
import { ObjectId } from 'mongodb';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { TYPES } from './config/types';
import { DataService } from './data.service';
import { DuplicateEntry, IdDoesNotExist, SomethingWentWrong } from '../exceptions/exception';
import { IOntoPage, BINDING_TYPE } from '../infrastructure/onto-page/onto-page.interface';
import { OntoPageVm } from '../infrastructure/onto-page/onto-page.vm';
import { OntoPageFilterVm, ONTOPAGE_SORT_BY } from '../infrastructure/onto-page/onto-page-filter.vm';
import { PaginationVm } from '../infrastructure/pagination.vm';
import { SORT_ORDER } from '../infrastructure/sort-order.enum';
import { MAPPING_TYPES } from './config/automapper.config';
import { UpdateOntoPageDataVm } from '../infrastructure/onto-page/update-onto-page-data.vm';


@provide(TYPES.OntoPageService)
export class OntoPageService extends DataService<IOntoPage> {
    public constructor(
        @inject(TYPES.DbClient) dbClient: DbClient,
    ) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.onto_page'));
    }

    public async getMultiple(ids: string[]): Promise<IOntoPage[]> {
        return await this.getAll({ _id: { $in: ids.map((id) => new ObjectId(id)) } });
    }

    async getPaginated(ontoPageFilterVm: OntoPageFilterVm): Promise<PaginationVm<IOntoPage>> {
        console.log('OntoPageService:getPaginated: ontoPageFilterVm = ', ontoPageFilterVm)
        let totalCount: number = 0;
        const query:  any = {};

        if (ontoPageFilterVm.filterPageType) {
            totalCount = await this.getDbCollection().find({ bindingType: ontoPageFilterVm.filterPageType }).count();
            query.bindingType = ontoPageFilterVm.filterPageType;
        } else {
            totalCount = await this.getDbCollection().countDocuments();
        }

        if (ontoPageFilterVm.filterId) {
            query._id = new ObjectId(ontoPageFilterVm.filterId);
        }

        const pageIndex: number = ontoPageFilterVm.pageIndex ? parseInt(ontoPageFilterVm.pageIndex) : 1;
        const pageSize: number = ontoPageFilterVm.pageSize ? parseInt(ontoPageFilterVm.pageSize) : totalCount;
        const sortBy: string = ontoPageFilterVm.sortBy; // Not used as we are using only one field, date
        const sortOrder: number = ontoPageFilterVm.sortOrder == SORT_ORDER.ASC ? 1 : -1;

        console.log("OntoPageService:getPaginated: query = ", query);
        let ontoPages: IOntoPage[] = [];
        ontoPages = await this.getDbCollection()
            .find(query)
            .sort( { date: sortOrder } )
            .skip(pageSize * (pageIndex - 1))
            .limit(pageSize)
            .toArray()


        console.log('OntoPageService:getPaginated: #ontoPages = ', ontoPages.length, 'totalCount = ', totalCount);

        return {
            data: automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, ontoPages),
            page: pageIndex,
            pageCount: pageSize,
            totalCount: totalCount,
        } as PaginationVm<IOntoPage>;
    }

    public async getPagesBindingVisIdAndDataId(_visId: string, _dataId: string): Promise<string[]> {
        const pages = await this.getAll({ bindings: { $elemMatch: { visId: _visId, dataIds: { $in: [_dataId] } } } });
        console.log('OntoPageService:getPagesBindingVisIdAndDataId: visId = ', _visId, 'dataId = ', _dataId, 'pages = ', pages)
        return pages.map(d => d._id.toString())
    }

    private async getPageBindingVisIdAndDataIds(bindingType: BINDING_TYPE, _visId: string, _dataIds: string[]): Promise<IOntoPage[]> {
        const pages = await this.getAll({ bindingType: bindingType, bindings: { $elemMatch: { visId: _visId, dataIds: { $in: _dataIds } } } });
        return pages;
    }

    public async getExamplePagesBindingVisId(_visId: string): Promise<IOntoPage[]> {
        return await this.getAll({ bindingType: BINDING_TYPE.EXAMPLE, bindings: { $elemMatch: { visId: _visId } } });
    }

    public async createPage(ontoPageVm: OntoPageVm): Promise<IOntoPage> {

        let exits = await this.getPageBindingVisIdAndDataIds(ontoPageVm.bindingType, ontoPageVm.bindings[0].visId, ontoPageVm.bindings[0].dataIds);
        if (exits.length) {
            throw new DuplicateEntry(`page type: ${ontoPageVm.bindingType}, visId: ${ontoPageVm.bindings[0].visId} and dataIds: ${JSON.stringify(ontoPageVm.bindings[0].dataIds)}`);
        }

        console.log('OntoPageService:createPage: ontoPageVm = ', ontoPageVm);

        let ontoPage: IOntoPage = {
            _id: new ObjectId(),
            nrows: ontoPageVm.nrows,
            bindingType: ontoPageVm.bindingType,
            date: new Date(),
            bindings: ontoPageVm.bindings,
        };

        if (ontoPageVm.nrows) {
            ontoPage.nrows = ontoPageVm.nrows;
        }

        return await this.create(ontoPage);
    }

    public async updatePage(pageId: string, ontoPageVm: OntoPageVm): Promise<IOntoPage> {
        let data: IOntoPage = await this.get(pageId);
        if (!data) throw new IdDoesNotExist(pageId);

        let ontoPage: IOntoPage = {
            bindingType: ontoPageVm.bindingType,
            date: new Date(),
            bindings: ontoPageVm.bindings,
        } as any;

        if (ontoPageVm.nrows) {
            ontoPage.nrows = ontoPageVm.nrows;
        }

        return await this.updateAndGet(pageId, ontoPage);
    }

    public async updatePageData(pageId: string, dataIds: UpdateOntoPageDataVm): Promise<any> {
        return this.getDbCollection().updateOne(
            { _id: new ObjectId(pageId)},
            { $set: { "bindings.0.dataIds": dataIds} },
            { upsert: false }
         );
    }
}

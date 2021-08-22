import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
import { ObjectId } from 'mongodb';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { TYPES } from './config/types';
import { DataService } from './data.service';
import { DuplicateEntry, IdDoesNotExist, SomethingWentWrong } from '../exceptions/exception';
import { IOntoPage, PAGE_TYPE } from '../infrastructure/onto-page/onto-page.interface';
import { OntoPageVm } from '../infrastructure/onto-page/onto-page.vm';
import { OntoPageFilterVm, ONTOPAGE_SORT_BY } from '../infrastructure/onto-page/onto-page-filter.vm';
import { PaginationVm } from '../infrastructure/pagination.vm';
import { SORT_ORDER } from '../infrastructure/sort-order.enum';
import { MAPPING_TYPES } from './config/automapper.config';


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
            totalCount = await this.getDbCollection().find({ pageType: ontoPageFilterVm.filterPageType }).count();
            query.pageType = ontoPageFilterVm.filterPageType;
        } else {
            totalCount = await this.getDbCollection().countDocuments();
        }

        // TODO: Implement filterVisType

        if (ontoPageFilterVm.filterId) {
            query._id = new ObjectId(ontoPageFilterVm.filterId);
        }

        const pageIndex: number = ontoPageFilterVm.pageIndex ? parseInt(ontoPageFilterVm.pageIndex) : 1;
        const pageSize: number = ontoPageFilterVm.pageSize ? parseInt(ontoPageFilterVm.pageSize) : totalCount;
        const sortOrder: number = ontoPageFilterVm.sortOrder == SORT_ORDER.ASC ? 1 : -1;

        console.log("OntoPageService:getPaginated: query = ", query);
        let ontoPages: IOntoPage[] = [];
        ontoPages = await this.getDbCollection()
            .find(query)
            .sort( { date: sortOrder } )
            .skip(pageSize * (pageIndex - 1))
            .limit(pageSize)
            .toArray()
        return {
            data: automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, ontoPages),
            page: pageIndex,
            pageCount: pageSize,
            totalCount: totalCount,
        } as PaginationVm<IOntoPage>;
    }

    public async getPagesBindingVisIdAndDataId(_visId: string, _dataId: string): Promise<string[]> {
        const pages = await this.getAll({ visId: _visId, dataIds: { $in: [_dataId] } });
        console.log('OntoPageService:getPagesBindingVisIdAndDataId: visId = ', _visId, 'dataId = ', _dataId, 'pages = ', pages)
        return pages.map(d => d._id.toString())
    }

    private async getPageBindingVisIdAndDataIds(_pageType: PAGE_TYPE, _visId: string, _dataIds: string[]): Promise<IOntoPage[]> {
        const pages = await this.getAll({ pageType: _pageType, visId: _visId, dataIds: { $in: _dataIds } });
        return pages;
    }

    public async getExamplePagesBindingVisId(_visId: string): Promise<IOntoPage[]> {
        return await this.getAll({ pageType: PAGE_TYPE.EXAMPLE, visId: _visId });
    }

    public async createPage(ontoPageVm: OntoPageVm): Promise<IOntoPage> {

        let exits = await this.getPageBindingVisIdAndDataIds(ontoPageVm.pageType, ontoPageVm.visId, ontoPageVm.dataIds);
        if (exits.length) {
            throw new DuplicateEntry(`page type: ${ontoPageVm.pageType}, visId: ${ontoPageVm.visId} and dataIds: ${JSON.stringify(ontoPageVm.dataIds)}`);
        }

        console.log('OntoPageService:createPage: ontoPageVm = ', ontoPageVm);

        let ontoPage: IOntoPage = {
            _id: new ObjectId(),
            pageType: ontoPageVm.pageType,
            date: new Date(),
            visId: ontoPageVm.visId,
            dataIds: ontoPageVm.dataIds,
        };

        if (ontoPageVm.pageIds && ontoPageVm.pageIds.length > 0) {
            ontoPage.pageIds = ontoPageVm.pageIds;
        }

        return await this.create(ontoPage);
    }

    public async updatePage(pageId: string, ontoPageVm: OntoPageVm): Promise<IOntoPage> {
        let existingOntoPage: IOntoPage = await this.get(pageId);
        if (!existingOntoPage) throw new IdDoesNotExist(pageId);

        let ontoPage: IOntoPage = {
            pageType: ontoPageVm.pageType,
            date: new Date(),
            visId: ontoPageVm.visId,
            dataIds: ontoPageVm.dataIds,
            pageIds: ontoPageVm?.pageIds,
        } as any;

        return await this.updateAndGet(pageId, ontoPage);
    }

    public async updatePageDataIds(pageId: string, dataIds: string[]): Promise<any> {
        return this.getDbCollection().updateOne(
            { _id: new ObjectId(pageId)},
            { $set: { "dataIds": dataIds} },
            { upsert: false }
         );
    }

    public async updatePageType(pageId: string, pageType: PAGE_TYPE): Promise<any> {
        return this.getDbCollection().updateOne(
            { _id: new ObjectId(pageId)},
            { $set: { 'pageType': pageType} },
            { upsert: false }
         );
    }
}

import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
import { ObjectId } from 'mongodb';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { TYPES } from './config/types';
import { DataService } from './data.service';
import { DuplicateEntry, IdDoesNotExist } from '../exceptions/exception';
import { IOntoPage, PAGE_TYPE } from '../infrastructure/onto-page/onto-page.interface';
import { OntoPageVm } from '../infrastructure/onto-page/onto-page.vm';
import { OntoPageFilterVm } from '../infrastructure/onto-page/onto-page-filter.vm';
import { PaginationVm } from '../infrastructure/pagination.vm';
import { SORT_ORDER } from '../infrastructure/sort-order.enum';
import { MAPPING_TYPES } from './config/automapper.config';
import { OntoVisService } from './onto-vis.service';
import { IOntoVis } from '../infrastructure/onto-vis/onto-vis.interface';
import { VIS_TYPE } from '../infrastructure/onto-vis/onto-vis-type.enum';
import { logger } from '../utils/logger';

@provide(TYPES.OntoPageService)
export class OntoPageService extends DataService<IOntoPage> {
    public constructor(
        @inject(TYPES.DbClient) dbClient: DbClient,
        @inject(TYPES.OntoVisService) private ontoVisService: OntoVisService
    ) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.onto_page'));
    }

    public async getMultiple(ids: string[]): Promise<IOntoPage[]> {
        return await this.getAll({ _id: { $in: ids.map((id) => new ObjectId(id)) } });
    }

    async getPaginated(
        pageType: PAGE_TYPE | 'all',
        visType: VIS_TYPE | 'all',
        ontoPageFilterVm: OntoPageFilterVm = null as any
    ): Promise<PaginationVm<IOntoPage>> {
        // prettier-ignore
        logger.info( `OntoPageService:getPaginated: pageType=${pageType}, visType=${visType}, ontoPageFilterVm=${JSON.stringify( ontoPageFilterVm )}` );
        let query: any = {};

        if (pageType !== 'all') {
            query.pageType = pageType;
        }

        if (visType !== 'all') {
            let visIds: string[] = (await this.ontoVisService.getAll({ type: visType })).map(
                (d: IOntoVis) => d._id as string
            );
            query.visId = { $in: visIds };
        }

        let totalCount: number = await this.getDbCollection().find(query).count();
        logger.info(`OntoPageService:getPaginated: query = ${JSON.stringify(query)}`);

        if (ontoPageFilterVm.filterId) {
            query._id = new ObjectId(ontoPageFilterVm.filterId);
        }

        const pageIndex: number = ontoPageFilterVm.pageIndex ? parseInt(ontoPageFilterVm.pageIndex) : 0;
        const pageSize: number = ontoPageFilterVm.pageSize ? parseInt(ontoPageFilterVm.pageSize) : totalCount;

        // prettier-ignore
        logger.info(`OntoPageService:getPaginated: pageSize = ${pageSize}, pageIndex = ${pageIndex}, , sortOrder = ${ontoPageFilterVm.sortOrder}, totalCount = ${totalCount}`);

        let ontoPages: IOntoPage[] = [];
        ontoPages = await this.getDbCollection()
            .find(query)
            .sort('date', ontoPageFilterVm.sortOrder)
            .skip(pageSize * pageIndex)
            .limit(pageSize)
            .toArray();
        return {
            data: automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, ontoPages),
            page: pageIndex,
            pageCount: pageSize,
            totalCount: totalCount,
        } as PaginationVm<IOntoPage>;
    }

    public async getPagesBindingVisIdAndDataId(_visId: string, _dataId: string): Promise<string[]> {
        const pages = await this.getAll({ visId: _visId, dataIds: { $in: [_dataId] } });
        // prettier-ignore
        // console.log( 'OntoPageService:getPagesBindingVisIdAndDataId: visId = ', _visId, 'dataId = ', _dataId, 'pages = ', pages );
        return pages.map((d) => d._id.toString());
    }

    private async getPageBindingVisIdAndDataIds(
        _pageType: PAGE_TYPE,
        _visId: string,
        _dataIds: string[]
    ): Promise<IOntoPage[]> {
        const pages = await this.getAll({ pageType: _pageType, visId: _visId, dataIds: { $in: _dataIds } });
        return pages;
    }

    public async getExamplePagesBindingVisId(_visId: string): Promise<IOntoPage[]> {
        return await this.getAll({ pageType: PAGE_TYPE.EXAMPLE, visId: _visId });
    }

    // Ref. on how to query array?
    // https://docs.mongodb.com/manual/tutorial/query-arrays/
    public async getPagesBindingDataId(dataId: string): Promise<IOntoPage[]> {
        return await this.getAll({ dataIds: [dataId] });
    }

    public async createPage(ontoPageVm: OntoPageVm): Promise<IOntoPage> {
        let exits = await this.getPageBindingVisIdAndDataIds(ontoPageVm.pageType, ontoPageVm.visId, ontoPageVm.dataIds);
        if (exits.length) {
            throw new DuplicateEntry(
                `page type: ${ontoPageVm.pageType}, visId: ${ontoPageVm.visId} and dataIds: ${JSON.stringify(
                    ontoPageVm.dataIds
                )}`
            );
        }

        // console.log('OntoPageService:createPage: ontoPageVm = ', ontoPageVm);

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
            { _id: new ObjectId(pageId) },
            { $set: { dataIds: dataIds } },
            { upsert: false }
        );
    }

    public async updatePageType(pageId: string, pageType: PAGE_TYPE): Promise<any> {
        return this.getDbCollection().updateOne(
            { _id: new ObjectId(pageId) },
            { $set: { pageType: pageType } },
            { upsert: false }
        );
    }
}

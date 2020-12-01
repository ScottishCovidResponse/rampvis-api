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
import { OntoDataFilterVm, ONTODATA_SORT_BY, SORT_ORDER } from '../infrastructure/onto-data/onto-data-filter.vm';
import { PaginationVm } from '../infrastructure/pagination.vm';
import { DATA_TYPE } from '../infrastructure/onto-data/onto-data-types';
import { logger } from '../utils/logger';

@provide(TYPES.OntoDataService)
export class OntoDataService extends DataService<IOntoData> {
    public constructor(@inject(TYPES.DbClient) dbClient: DbClient) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.onto_data'));
    }

    public async getAllData(ontoDataFilterVm: OntoDataFilterVm): Promise<PaginationVm<IOntoData>> {
        let result: IOntoData[] =  [];

        // Filter by dataType
        if (ontoDataFilterVm.dataType && Object.values(DATA_TYPE).includes(ontoDataFilterVm.dataType)) {
            result = await this.getAll({ dataType: ontoDataFilterVm.dataType })
        } else {
            result = await this.getAll()
        }

        logger.debug(`getAllData: result = ${JSON.stringify(result)}`)
        return this.getPaginatedOntoDataList(result, ontoDataFilterVm);
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
            productDesc: dataVm.productDesc,
            streamDesc: dataVm.streamDesc,
            source: dataVm?.source,
            model: dataVm?.model,
            analytics: dataVm?.analytics,
            date: new Date(),
            queryParams: dataVm.queryParams,
        };
        return await this.create(data);
    }

    public async updateData(dataId: string, dataVm: OntoDataVm): Promise<IOntoData> {
        let data: IOntoData = await this.get({ endpoint: dataVm.endpoint, urlCode: dataVm.urlCode });
        if (data && data._id !== dataId) throw new DuplicateEntry(`${dataVm.urlCode}${dataVm.endpoint}`);
        
        data = await this.get(dataId);
        if (!data) throw new IdDoesNotExist(dataId);

        data = {
            urlCode: dataVm.urlCode,
            endpoint: dataVm.endpoint,
            dataType: dataVm.dataType,
            productDesc: dataVm.productDesc,
            streamDesc: dataVm.streamDesc,
            source: dataVm?.source,
            model: dataVm?.model,
            analytics: dataVm?.analytics,
            date: new Date(),
            queryParams: dataVm.queryParams,
        } as any;

        return await this.updateAndGet(dataId, data);
    }

    //
    // Private Functions
    //

    private getPaginatedOntoDataList(ontoDataList: Array<IOntoData>, ontoDataFilterVm: OntoDataFilterVm, ): PaginationVm<IOntoData> {
        const page: number = ontoDataFilterVm.page ? parseInt(ontoDataFilterVm.page) : 0;
        let pageCount: number = ontoDataFilterVm.pageCount ? parseInt(ontoDataFilterVm.pageCount) : Infinity;
        const sortBy: ONTODATA_SORT_BY = ontoDataFilterVm.sortBy || ONTODATA_SORT_BY.DATE;
        const sortOrder: SORT_ORDER = ontoDataFilterVm.sortOrder || SORT_ORDER.ASC;

        let result: Array<IOntoData> = ontoDataList;

        if (ontoDataFilterVm.filter && ontoDataFilterVm.filter.length > 0) {
            const filter = ontoDataFilterVm.filter.toLowerCase();
            result = result.filter((a) => a.productDesc.match(new RegExp(filter, 'i')) || a.streamDesc.match(new RegExp(filter, 'i')) );
        }

        if (sortBy == ONTODATA_SORT_BY.DATA_TYPE) {
            result = result.sort((a, b) => {
                if (a.dataType >= b.dataType) return 1;
                return -1;
            });
        } else if (sortBy == ONTODATA_SORT_BY.PROD_DESC) {
            result = result.sort((a, b) => {
                if (a.productDesc >= b.productDesc) return 1;
                return -1;
            });
        } else if (sortBy == ONTODATA_SORT_BY.STREAM_DESC) {
            result = result.sort((a, b) => {
                if (a.streamDesc >= b.streamDesc) return 1;
                return -1;
            });
        } else if (sortBy == ONTODATA_SORT_BY.DATE) {
            result = result.sort((a, b) => {
                if (a.date >= b.date) return 1;
                return -1;
            });
        }

        if (sortOrder == SORT_ORDER.DESC) {
            result = result.reverse();
        }

        return {
            data: this.paginate(result, pageCount, page),
            page: page,
            pageCount: pageCount,
            totalCount: result.length,
        } as PaginationVm<IOntoData>;
        
    }

    private paginate(list: IOntoData[], pageCount: number, page: number): Array<IOntoData> {
        logger.debug(`paginate: list = ${JSON.stringify(list)}`)
        return list.slice(page * pageCount, (page + 1) * pageCount);
    }

    //
    // search
    //
    async search(queryStr: string): Promise<IOntoData[]> {
        let pipeline = [
            {
                $match: {
                    $text: {
                        $search: queryStr,
                    },
                },
            },
            { $sort: { score: { $meta: 'textScore' } } },
        ];
        return this.getDbCollection().aggregate(pipeline).toArray();
    }
}

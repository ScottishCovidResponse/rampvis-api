import { ObjectId } from 'bson';
import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
import * as _ from 'lodash';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { TYPES } from './config/types';
import { DataService } from './data.service';
import { IOntoData } from '../infrastructure/onto-data/onto-data.interface';
import { OntoDataVm } from '../infrastructure/onto-data/onto-data.vm';
import { DuplicateEntry, IdDoesNotExist } from '../exceptions/exception';
import { OntoDataFilterVm, SORT_BY } from '../infrastructure/onto-data/onto-data-filter.vm';
import { PaginationVm } from '../infrastructure/pagination.vm';
import { DATA_TYPE } from '../infrastructure/onto-data/onto-data-types';
import { logger } from '../utils/logger';
import { SORT_ORDER } from '../infrastructure/sort-order.enum';
import { IOntoDataSearchGroup } from '../infrastructure/onto-data/onto-data-search-group.interface';
import { OntoDataDto } from '../infrastructure/onto-data/onto-data.dto';
import { MAPPING_TYPES } from './config/automapper.config';

@provide(TYPES.OntoDataService)
export class OntoDataService extends DataService<IOntoData> {
    public constructor(
        @inject(TYPES.DbClient) dbClient: DbClient,
    ) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.onto_data'));
    }

    public async getOntoDataDtos(ids: string[]): Promise<OntoDataDto[]> {
        let ontoDataDtos: OntoDataDto[] = [];
        for (let id of ids) {
            const ontoData: IOntoData = await this.get(id);
            let ontoDataDto: OntoDataDto = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, ontoData);
            ontoDataDtos.push(ontoDataDto);
        }
        return ontoDataDtos;
    }

    public async getAllData(ontoDataFilterVm: OntoDataFilterVm): Promise<PaginationVm<IOntoData>> {
        let result: IOntoData[] = [];

        // Filter by dataType
        if (ontoDataFilterVm.dataType && Object.values(DATA_TYPE).includes(ontoDataFilterVm.dataType)) {
            result = await this.getAll({ dataType: ontoDataFilterVm.dataType });
        } else {
            result = await this.getAll();
        }

        // logger.debug(`getAllData: result = ${JSON.stringify(result)}`);
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
            keywords: dataVm.keywords.join(', '),
            description: dataVm.description,
            date: new Date(),
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
            description: dataVm.description,
            keywords: dataVm.keywords.join(', '),
            date: new Date(),
        } as any;

        return await this.updateAndGet(dataId, data);
    }

    private getPaginatedOntoDataList(ontoDataList: Array<IOntoData>, ontoDataFilterVm: OntoDataFilterVm): PaginationVm<IOntoData> {
        logger.debug(`OntoDataService:getPaginatedOntoDataList: ontoDataFilterVm = ${JSON.stringify(ontoDataFilterVm)}`);

        const pageIndex: number = ontoDataFilterVm.pageIndex ? parseInt(ontoDataFilterVm.pageIndex) : 0;
        let pageSize: number = ontoDataFilterVm.pageSize ? parseInt(ontoDataFilterVm.pageSize) : Infinity;
        const sortBy: SORT_BY = ontoDataFilterVm.sortBy || SORT_BY.DATE;
        const sortOrder: SORT_ORDER = ontoDataFilterVm.sortOrder || SORT_ORDER.ASC;

        let result: Array<IOntoData> = ontoDataList;

        if (ontoDataFilterVm.filter && ontoDataFilterVm.filter.length > 0) {
            const filter = ontoDataFilterVm.filter.toLowerCase();
            result = result.filter((d) => {
                return (
                    d?.description?.match(new RegExp(filter, 'i')) ||
                    d?._id.toString().match(new RegExp(filter, 'i')) ||
                    d?.endpoint.toString().match(new RegExp(filter, 'i')) ||
                    d?.keywords.match(new RegExp(filter, 'i'))
                );
            });
        }

        if (sortBy == SORT_BY.DATA_TYPE) {
            result = result.sort((a, b) => {
                if (a.dataType >= b.dataType) return 1;
                return -1;
            });
        } else if (sortBy == SORT_BY.DESCRIPTION) {
            result = result.sort((a, b) => {
                if (a.description >= b.description) return 1;
                return -1;
            });
        } else if (sortBy == SORT_BY.DATE) {
            result = result.sort((a, b) => {
                if (a.date >= b.date) return 1;
                return -1;
            });
        }

        if (sortOrder == SORT_ORDER.DESC) {
            result = result.reverse();
        }

        return {
            totalCount: result.length,
            data: this.paginate(result, pageSize, pageIndex),
            page: pageIndex,
            pageCount: pageSize,
        } as PaginationVm<IOntoData>;
    }

    private paginate(list: IOntoData[], pageSize: number, pageIndex: number): Array<IOntoData> {
        logger.debug(`OntoDataService: paginate: pageSize = ${pageSize}, pageIndex = ${pageIndex}`);
        // logger.debug(`OntoDataService: paginate: list = ${JSON.stringify(list)}`);
        return list.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    }

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

    //
    // Group - search and group for propagation
    //

    public async getGroupsMatchingExampleDataOfVis(len: number): Promise<IOntoDataSearchGroup[]> {

        const ontoData: IOntoData[] = await this.getAll();
        const ontoDataSearchGroup: IOntoDataSearchGroup[] = [];
        for (let d of _.chunk(ontoData, len)) {
            ontoDataSearchGroup.push({ score: 0, groups: d } as IOntoDataSearchGroup);
        }
        return ontoDataSearchGroup;
    }
}

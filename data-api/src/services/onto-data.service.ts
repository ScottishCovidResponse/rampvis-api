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

    //
    // Private Functions
    //

    private getPaginatedOntoDataList(ontoDataList: Array<IOntoData>, ontoDataFilterVm: OntoDataFilterVm, ): PaginationVm<IOntoData> {
        const page: number = ontoDataFilterVm.page ? parseInt(ontoDataFilterVm.page) : 0;
        let pageCount: number | undefined = ontoDataFilterVm.pageCount ? parseInt(ontoDataFilterVm.pageCount) : undefined; // undefined => return all to Flask UI
        const sortBy: ONTODATA_SORT_BY = ontoDataFilterVm.sortBy || ONTODATA_SORT_BY.TITLE;
        const sortOrder: SORT_ORDER = ontoDataFilterVm.sortOrder || SORT_ORDER.ASC;

        let result: Array<IOntoData> = ontoDataList;

        // TODO complete it
        /*
        if (ontoDataFilterVm.filter && ontoDataFilterVm.filter.length > 0) {
            const filter = ontoDataFilterVm.filter.toLowerCase();
            result = result.filter((a) => a.title.match(new RegExp(filter, 'i')));
        }

        if (sortBy == SORT_BY_FILTER_ONTOPAGE.TITLE) {
            result = result.sort((a, b) => {
                if (a.title >= b.title) return 1;
                return -1;
            });
        } else if (sortBy == SORT_BY_FILTER_ONTOPAGE.PUBLISH_TYPE) {
            result = result.sort((a, b) => {
                if (a.publishType >= b.publishType) return 1;
                return -1;
            });
        } else if (sortBy == SORT_BY_FILTER_ONTOPAGE.DATE) {
            result = result.sort((a, b) => {
                if (a.date >= b.date) return 1;
                return -1;
            });
        }

        if (sortOrder == SORT_ORDER_FILTER.DESC) {
            result = result.reverse();
        }
        */

        return {
            data: this.paginate(result, pageCount, page),
            page: page,
            pageCount: pageCount,
            totalCount: result.length,
        } as PaginationVm<IOntoData>;
        
    }

    private paginate(array: Array<IOntoData>, page_size: number | undefined, page_number: number): Array<IOntoData> {
        if (!page_size) return array; // undefined => return all
        else return array.slice(page_number * page_size, (page_number + 1) * page_size);
    }
}

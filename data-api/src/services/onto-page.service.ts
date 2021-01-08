import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
import { FilterQuery, ObjectId } from 'mongodb';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { TYPES } from './config/types';
import { DataService } from './data.service';
import { IdDoesNotExist, SomethingWentWrong } from '../exceptions/exception';
import { IOntoPage, BINDING_TYPE } from '../infrastructure/onto-page/onto-page.interface';
import { OntoPageVm } from '../infrastructure/onto-page/onto-page.vm';
import { OntoPageFilterVm, ONTOPAGE_SORT_BY, SORT_ORDER } from '../infrastructure/onto-page/onto-page-filter.vm';
import { PaginationVm } from '../infrastructure/pagination.vm';


@provide(TYPES.OntoPageService)
export class OntoPageService extends DataService<IOntoPage> {
    public constructor(
        @inject(TYPES.DbClient) dbClient: DbClient,
    ) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.onto_page'));
    }

    async getAllPages(ontoPageFilterVm: OntoPageFilterVm): Promise<PaginationVm<IOntoPage>> {
        let ontoPages: IOntoPage[] = [];

        if (Object.values(BINDING_TYPE).includes(ontoPageFilterVm.bindingType)) {
            ontoPages = await this.getAll({ bindingType: ontoPageFilterVm.bindingType });
        } else {
            ontoPages = await this.getAll();
        }

        return this.getPaginatedOntoPages(ontoPages, ontoPageFilterVm);
    }

    public async getPagesBindingVisIdAndDataId(_visId: string, _dataId: string): Promise<string[]> {
        const pages = await this.getAll({ bindings: { $elemMatch: { visId: _visId, dataIds: { $in: [_dataId] } } } });
        console.log('visId = ', _visId, 'dataId = ', _dataId, 'pages = ', pages)
        return pages.map(d => d._id.toString())
    }

    public async getExamplePagesBindingVisId(_visId: string): Promise<IOntoPage[]> {
        return await this.getAll({ bindingType: BINDING_TYPE.EXAMPLE, bindings: { $elemMatch: { visId: _visId } } });
    }

    public async createPage(ontoPageVm: OntoPageVm): Promise<IOntoPage> {
        // TODO -  check if exist based on some condition

        let ontoPage: IOntoPage = {
            _id: new ObjectId(),
            nrows: ontoPageVm.nrows,
            bindingType: ontoPageVm.bindingType,
            date: new Date(),
            bindings: ontoPageVm.bindings,
        };
        return await this.create(ontoPage);
    }

    public async updatePage(pageId: string, ontoPageVm: OntoPageVm): Promise<IOntoPage> {
        let data: IOntoPage = await this.get(pageId);
        if (!data) throw new IdDoesNotExist(pageId);

        let ontoPage: IOntoPage = {
            nrows: ontoPageVm.nrows,
            bindingType: ontoPageVm.bindingType,
            date: new Date(),
            bindings: ontoPageVm.bindings,
        } as any;

        return await this.updateAndGet(pageId, ontoPage);
    }

    private getPaginatedOntoPages( ontoPages: Array<IOntoPage>, ontoPageFilterVm: OntoPageFilterVm, ): PaginationVm<IOntoPage> {
        const pageIndex: number = ontoPageFilterVm.pageIndex ? parseInt(ontoPageFilterVm.pageIndex) : 0;
        let pageSize: number | undefined = ontoPageFilterVm.pageSize
            ? parseInt(ontoPageFilterVm.pageSize)
            : undefined; // undefined => return all
        const sortBy: ONTOPAGE_SORT_BY = ontoPageFilterVm.sortBy || ONTOPAGE_SORT_BY.DATE; // default
        const sortOrder: SORT_ORDER = ontoPageFilterVm.sortOrder || SORT_ORDER.ASC;

        let result: Array<IOntoPage> = ontoPages;

        if (ontoPageFilterVm.filter && ontoPageFilterVm.filter.length > 0) {
            const filter = ontoPageFilterVm.filter.toLowerCase();
            result = result.filter((a) => a._id.toString().match(new RegExp(filter, 'i')));
        }

        if (sortBy == ONTOPAGE_SORT_BY.BINDING_TYPE) {
            result = result.sort((a, b) => {
                if (a.bindingType >= b.bindingType) return 1;
                return -1;
            });
        } else if (sortBy == ONTOPAGE_SORT_BY.DATE) {
            result = result.sort((a, b) => {
                if (a.date >= b.date) return 1;
                return -1;
            });
        }

        if (sortOrder == SORT_ORDER.DESC) {
            result = result.reverse();
        }

        return {
            data: this.paginate(result, pageSize, pageIndex),
            page: pageIndex,
            pageCount: pageSize,
            totalCount: result.length,
        } as PaginationVm<IOntoPage>;
    }

    private paginate(array: Array<IOntoPage>, pageSize: number | undefined, pageIndex: number): Array<IOntoPage> {
        // undefined => return all
        if (!pageSize) {
            return array;
        } else {
            return array.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        }
    }
}

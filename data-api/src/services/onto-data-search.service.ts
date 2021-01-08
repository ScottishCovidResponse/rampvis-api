import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';

import { TYPES } from './config/types';
import { SearchService } from './search.service';
import { SearchClient } from '../infrastructure/db/elasticsearch.connection';
import { IOntoDataSearch } from '../infrastructure/onto-data/onto-data.interface';
import { OntoDataMapping } from '../infrastructure/onto-data/onto-data.mapping';
import { logger } from '../utils/logger';
import { DATA_TYPE } from '../infrastructure/onto-data/onto-data-types';
import { OntoDataSearchFilterVm } from '../infrastructure/onto-data/onto-data-search-filter.vm';
import { OntoPageService } from './onto-page.service';
import { PaginationVm } from '../infrastructure/pagination.vm';
import { ONTODATA_SORT_BY } from '../infrastructure/onto-data/onto-data-filter.vm';
import { SORT_ORDER } from '../infrastructure/onto-page/onto-page-filter.vm';

@provide(TYPES.OntoDataSearchService)
export class OntoDataSearchService extends SearchService<IOntoDataSearch> {

    public constructor(
        @inject(TYPES.SearchClient) searchClient: SearchClient,
        @inject(TYPES.OntoPageService) private ontoPageService: OntoPageService
    ) {
        // super(searchClient, config.get('es.index.onto_page'));
        super(searchClient, 'rampvis.onto_data');
    }

    public async putMapping() {
        logger.info(`OntoDataSearchService:putMapping: OntoDataMapping =  ${JSON.stringify(OntoDataMapping)}`);
        return await this._putMapping(OntoDataMapping);
    }

    public async search(ontoDataSearchFilterVm: OntoDataSearchFilterVm):  Promise<PaginationVm<IOntoDataSearch>> {
        const dsl: any = {
            query: {
                bool: {
                    minimum_should_match: 1,
                    should: [{ match: { description: ontoDataSearchFilterVm.query } }, { match: { keywords: ontoDataSearchFilterVm.query } }],
                },
            },
        };

        if (ontoDataSearchFilterVm.dataType) {
            dsl.query.bool.filter = [{ term: { dataType: ontoDataSearchFilterVm.dataType } }];
        }

        // logger.info(`OntoDataSearchService:search: dsl =  ${JSON.stringify(dsl)}`);
        // console.log('OntoDataSearchService:search: dsl = ', dsl);

        const res = await this._search(dsl);
        let result: IOntoDataSearch[] = res?.hits?.hits?.map((d: any) => { return { _id: d?._id, ...d?._source } });

        if (ontoDataSearchFilterVm.visId) {
            result = await Promise.all(
                result.map(async (d: IOntoDataSearch) => {
                    d.pageIds = await this.ontoPageService.getPagesBindingVisIdAndDataId(ontoDataSearchFilterVm.visId, d._id);
                    return d;
                })
            );
        }

        let paginatedResult =  this.getPaginatedOntoDataList(result, ontoDataSearchFilterVm);




        //console.log('OntoDataSearchService:search: res = ', res.hits.hits);
        // console.log('OntoDataSearchService:search: result = ', result);

        return paginatedResult;
    }

    public async searchAsYouType( queryStr: string, dataType: DATA_TYPE = undefined as any, ): Promise<Array<IOntoDataSearch>> {
        const dsl: any = {
            query: {
                multi_match: {
                    query: queryStr,
                    type: 'bool_prefix',
                    fields: [
                        'description',
                        'description._2gram',
                        'description._3gram',
                        'keywords',
                        'keywords._2gram',
                        'keywords._3gram',
                    ],
                },
            },
        };

        // TODO We have to filter?
        // if (dataType) {
        //     dsl.query.filter = {
        //         term: { "dataType.keyword": dataType },
        //     };
        // }

        const res: any = await this._searchAsYouType(dsl);
        const hits: IOntoDataSearch[] = res?.hits?.hits?.map((d: any) => d?._source);
        console.log('OntoDataSearchService:searchAsYouType: hits = ', hits);
        return hits;
    }

    //
    // TODO: This search completion function is not used now. This function to be reviewed if used later.
    //
    public async suggestCompletion(queryStr: string): Promise<Array<any>> {
        const dsl: any = {
            suggest: {
                data_stream_suggestion: {
                    prefix: queryStr,
                    completion: {
                        field: 'description',
                        skip_duplicates: true,
                        // fuzzy: { fuzziness: 2 },
                        // size: 5,
                    },
                },
                data_prod_suggestion: {
                    prefix: queryStr,
                    completion: {
                        field: 'keywords',
                        skip_duplicates: true,
                        // size: 5,
                    },
                },
            },
        };

        const res: any = await this._suggestCompletion(dsl);
        const product: any[] = res?.suggest?.data_prod_suggestion[0]?.options.map((d: any) => {
            return {
                score: d?._score,
                type: 'P',
                suggested: d._source.description,
            };
        });

        const stream: any[] = res?.suggest?.data_stream_suggestion[0]?.options.map((d: any) => {
            return {
                score: d?._score,
                type: 'S',
                suggested: d._source.streamDesc,
            };
        });

        // combine and sort
        let result = [...product, ...stream];
        result.sort((a, b) => a.score - b.score);

        return result;
    }

    private getPaginatedOntoDataList(ontoDataList: Array<IOntoDataSearch>, ontoDataSearchFilterVm: OntoDataSearchFilterVm): PaginationVm<IOntoDataSearch> {
        const pageIndex: number = ontoDataSearchFilterVm.pageIndex ? parseInt(ontoDataSearchFilterVm.pageIndex) : 0;
        let pageSize: number = ontoDataSearchFilterVm.pageSize ? parseInt(ontoDataSearchFilterVm.pageSize) : Infinity;
        const sortBy: ONTODATA_SORT_BY = ontoDataSearchFilterVm.sortBy || ONTODATA_SORT_BY.DATE;
        const sortOrder: SORT_ORDER = ontoDataSearchFilterVm.sortOrder || SORT_ORDER.ASC;

        let result: Array<IOntoDataSearch> = ontoDataList;

        if (ontoDataSearchFilterVm.filter && ontoDataSearchFilterVm.filter.length > 0) {
            const filter = ontoDataSearchFilterVm.filter.toLowerCase();
            result = result.filter((d) => {
                return (
                    d?.description?.match(new RegExp(filter, 'i')) ||
                    d?._id.toString().match(new RegExp(filter, 'i')) ||
                    d?.endpoint.toString().match(new RegExp(filter, 'i')) ||
                    d?.keywords.match(new RegExp(filter, 'i'))
                );
            });
        }

        if (sortBy == ONTODATA_SORT_BY.DATA_TYPE) {
            result = result.sort((a, b) => {
                if (a.dataType >= b.dataType) return 1;
                return -1;
            });
        } else if (sortBy == ONTODATA_SORT_BY.DESC) {
            result = result.sort((a, b) => {
                if (a.description >= b.description) return 1;
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
            data: this.paginate(result, pageSize, pageIndex),
            page: pageIndex,
            pageCount: pageSize,
            totalCount: result.length,
        } as PaginationVm<IOntoDataSearch>;
    }

    private paginate(list: IOntoDataSearch[], pageSize: number, pageIndex: number): Array<IOntoDataSearch> {
        // logger.debug(`paginate: list = ${JSON.stringify(list)}`);
        return list.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    }

}

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
 
@provide(TYPES.OntoDataSearchService)
export class OntoDataSearchService extends SearchService<IOntoDataSearch> {
    public constructor(@inject(TYPES.SearchClient) searchClient: SearchClient) {
        // super(searchClient, config.get('es.index.onto_page'));
        super(searchClient, 'rampvis.onto_data');
    }

    public async putMapping() {
        logger.info(`OntoDataSearchService:putMapping: OntoDataMapping =  ${JSON.stringify(OntoDataMapping)}`);
        return await this._putMapping(OntoDataMapping);
    }

    public async search(queryStr: string, dataType: DATA_TYPE = undefined as any): Promise<Array<IOntoDataSearch>> {
        const dsl: any = {
            query: {
                bool: {
                    minimum_should_match: 1,
                    should: [{ match: { description: queryStr } }, { match: { keyword: queryStr } }],
                },
            },
        };

        if (dataType) {
            dsl.query.bool.filter = [{ term: { dataType: dataType } }];
        }

        // logger.info(`OntoDataSearchService:search: dsl =  ${JSON.stringify(dsl)}`);
        // console.log('OntoDataSearchService:search: dsl = ', dsl);

        const res = await this._search(dsl);
        const hits: IOntoDataSearch[] = res?.hits?.hits?.map((d: any) => d?._source);
        console.log('OntoDataSearchService:search: hits = ', hits);
        return hits;
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


}

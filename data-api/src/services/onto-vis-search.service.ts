import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';

import { TYPES } from './config/types';
import { SearchService } from './search.service';
import { SearchClient } from '../infrastructure/db/elasticsearch.connection';
import { OntoDataMapping } from '../infrastructure/onto-data/onto-data.mapping';
import { logger } from '../utils/logger';
import { IOntoVisSearch } from '../infrastructure/onto-vis/onto-vis.interface';
import { OntoVisMapping } from '../infrastructure/onto-vis/onto-vis.mapping';
import { OntoVisSearchFilterVm } from '../infrastructure/onto-page/onto-vis-search-filter.vm';

@provide(TYPES.OntoVisSearchService)
export class OntoVisSearchService extends SearchService<IOntoVisSearch> {

    public constructor(
        @inject(TYPES.SearchClient) searchClient: SearchClient,
    ) {
        // super(searchClient, config.get('es.index.onto_page'));
        super(searchClient, 'rampvis.onto_vis');
    }

    public async putMapping() {
        logger.info(`OntoVisSearchService:putMapping: OntoVisMapping =  ${JSON.stringify(OntoVisMapping)}`);
        return await this._putMapping(OntoDataMapping);
    }

    public async search(ontoVisSearchFilterVm: OntoVisSearchFilterVm):  Promise<IOntoVisSearch[]> {
        const dsl: any = {
            query: {
                bool: {
                    minimum_should_match: 1,
                    should: [{ match: { description: ontoVisSearchFilterVm.query } }, { match: { function: ontoVisSearchFilterVm.query } }],
                },
            },
        };


        const res = await this._search(dsl);
        let result: IOntoVisSearch[] = res?.hits?.hits?.map((d: any) => { return { _id: d?._id, ...d?._source } });

        console.log('OntoVisSearchService:search: res = ', res.hits.hits);
        console.log('OntoVisSearchService:search: result = ', result);

        return result;
    }

    public async searchAsYouType( queryStr: string): Promise<IOntoVisSearch[]> {
        const dsl: any = {
            query: {
                multi_match: {
                    query: queryStr,
                    type: 'bool_prefix',
                    fields: [
                        'description',
                        'description._2gram',
                        'description._3gram',
                        'function',
                        'function._2gram',
                        'function._3gram',
                    ],
                },
            },
        };

        const res: any = await this._searchAsYouType(dsl);
        const hits: IOntoVisSearch[] = res?.hits?.hits?.map((d: any) => d?._source);
        console.log('OntoVisSearchService:searchAsYouType: hits = ', hits);
        return hits;
    }

}

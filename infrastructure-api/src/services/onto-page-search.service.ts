import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';

import { TYPES } from './config/types';
import { SearchService } from './search.service';
import { SearchClient } from '../infrastructure/db/elasticsearch.connection';
import { logger } from '../utils/logger';
import { OntoPageService } from './onto-page.service';
import { OntoPageMapping } from '../infrastructure/onto-page/onto-page.mapping';
import { IOntoPageSearch } from '../infrastructure/onto-page/onto-page-search.interface';
import { OntoPageSearchFilterVm } from '../infrastructure/onto-page/onto-page-search-filter.vm';

@provide(TYPES.OntoPageSearchService)
export class OntoPageSearchService extends SearchService<IOntoPageSearch> {
    public constructor(
        @inject(TYPES.SearchClient) searchClient: SearchClient,
        @inject(TYPES.OntoPageService) private ontoPageService: OntoPageService
    ) {
        // super(searchClient, config.get('es.index.onto_page'));
        super(searchClient, 'rampvis.onto_page');
    }

    public async putMapping() {
        logger.info(`OntoPageSearchService:putMapping: OntoPageMapping =  ${JSON.stringify(OntoPageMapping)}`);
        return await this._putMapping(OntoPageMapping);
    }

    public async search(ontoPageSearchFilterVm: OntoPageSearchFilterVm): Promise<IOntoPageSearch[]> {
        const dsl: any = {
            query: {
                bool: {
                    minimum_should_match: 1,
                    should: [
                        { match: { dataDescription: ontoPageSearchFilterVm.query } },
                        { match: { keywords: ontoPageSearchFilterVm.query } },
                        { match: { keywords: ontoPageSearchFilterVm.query } },
                    ],
                },
            },
        };

        logger.info(`OntoPageSearchService:search: dsl =  ${JSON.stringify(dsl)}`);

        const res = await this._search(dsl);
        let result: IOntoPageSearch[] = res?.hits?.hits?.map((d: any) => {
            return { _id: d?._id, ...d?._source, _score: d?._score };
        });

        // if (ontoDataSearchFilterVm.visId) {
        //     result = await Promise.all(
        //         result.map(async (d: IOntoDataSearch) => {
        //             d.pageIds = await this.ontoPageService.getPagesBindingVisIdAndDataId(
        //                 ontoDataSearchFilterVm.visId,
        //                 d._id
        //             );
        //             return d;
        //         })
        //     );
        // }

        // TODO- paginated list
        // let paginatedResult = this.getPaginatedOntoDataList(result, ontoDataSearchFilterVm);

        console.log('OntoPageSearchService:search: res?.hits?.hits? = ', res?.hits?.hits, result.length);
        // console.log('OntoPageSearchService:search: result = ', paginatedResult, paginatedResult.data.length);

        return result;
    }
}

import config from "config";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";

import { TYPES } from "./config/types";
import { SearchService } from "./search.service";
import { SearchClient } from "../infrastructure/db/elasticsearch.connection";
import { logger } from "../utils/logger";
import { OntoPageService } from "./onto-page.service";
import { OntoPageMapping } from "../infrastructure/onto-page/onto-page.mapping";
import { IOntoPageSearch } from "../infrastructure/onto-page/onto-page-search.interface";
import { OntoPageSearchFilterVm } from "../infrastructure/onto-page/onto-page-search-filter.vm";

@provide(TYPES.OntoPageSearchService)
export class OntoPageSearchService extends SearchService<IOntoPageSearch> {
  public constructor(
    @inject(TYPES.SearchClient) searchClient: SearchClient,
    @inject(TYPES.OntoPageService) private ontoPageService: OntoPageService
  ) {
    // super(searchClient, config.get('es.index.onto_page'));
    super(searchClient, "rampvis.onto_page");
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

    // logger.info(`OntoPageSearchService:search: dsl =  ${JSON.stringify(dsl)}`);

    const res = await this._search(dsl);
    let result: IOntoPageSearch[] = res?.hits?.hits?.map((d: any) => {
      return { _id: d?._id, ...d?._source, _score: d?._score };
    });

    // TODO paginated list
    logger.debug("OntoPageSearchService:search: res?.hits?.hits? = ", res?.hits?.hits, result.length);
    return result;
  }

  public async searchPage(visFunction: string, keyword: string): Promise<IOntoPageSearch[]> {
    const dsl: any = {
      query: {
        bool: {
          must: [{ match: { keywords: keyword } }],
          filter: [{ term: { visFunction: visFunction } }],
        },
      },
    };

    // logger.info(`OntoPageSearchService:searchLink: dsl =  ${JSON.stringify(dsl)}`);

    const res = await this._search(dsl);
    let result: IOntoPageSearch[] = res?.hits?.hits?.map((d: any) => {
      return { _id: d?._id, ...d?._source, _score: d?._score };
    });

    return result;
  }
}

import config from 'config';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';

import { TYPES } from './config/types';
import { SearchService } from './search.service';
import { SearchClient } from '../infrastructure/db/elasticsearch.connection';
import { IOntoPage } from '../infrastructure/onto-page/onto-page.interface';

@provide(TYPES.OntoPageSearchService)
export class OntoPageSearchService extends SearchService<IOntoPage> {
    public constructor(@inject(TYPES.SearchClient) searchClient: SearchClient) {
        super(searchClient, config.get('es.index.onto_page'));
    }   
}

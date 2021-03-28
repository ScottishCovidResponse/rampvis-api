import { NextFunction } from 'connect';
import { Response } from 'express-serve-static-core';
import { controller, httpGet } from 'inversify-express-utils';
import { inject } from 'inversify';

import { InvalidQueryParametersException, SearchError } from '../exceptions/exception';
import { logger } from '../utils/logger';
import { IRequestWithUser } from '../infrastructure/user/request-with-user.interface';
import { TYPES } from '../services/config/types';
import { SearchServiceV05 } from '../services/search.service.v0.5';

@controller('/scotland/search')
export class SearchControllerV05 {
    constructor(@inject(TYPES.SearchServiceV05) private searchServiceV05: SearchServiceV05) {}

    //
    // api/v1/scotland/search/?query=
    //
    @httpGet('/')
    public async search(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const query = request.query.query as string;
        logger.info('SearchControllerV05: search: query = ', query);

        if (!query) {
            return next(new InvalidQueryParametersException('Empty search input.'));
        }

        try {
            const res = await this.searchServiceV05.search(query);
            response.status(200).send(res);
        } catch (error) {
            next(new SearchError(error.message));
        }
    }
}

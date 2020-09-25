import {NextFunction} from 'connect';
import {Response} from 'express-serve-static-core';
import {controller, httpGet} from 'inversify-express-utils';

import { InvalidQueryParametersException, SearchError} from '../exceptions/exception';
import {logger} from '../utils/logger';
import {RequestWithUser} from '../infrastructure/entities/request-with-user.interface';
import {inject} from "inversify";
import {TYPES} from "../services/config/types";
import {SearchService} from "../services/search.service";

@controller('/v1/scotland/search')
export class SearchController {

    constructor(
        @inject(TYPES.SearchService) private searchService: SearchService
    ) {
    }

    //
    // api/v1/scotland/search/?query=
    //
    @httpGet('/')
    public async search(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const query = request.query.query as string;
        logger.info('SearchController: search: query = ', query);

        if (!query) {
            return next(new InvalidQueryParametersException('Empty search input.'));
        }

        try {
            const res = await this.searchService.search(query);
            response.status(200).send(res);
        } catch (error) {
            next(new SearchError(error.message));
        }
    }
}




/**
 * Deprecate
 */

import { NextFunction } from 'connect';
import { Response } from 'express-serve-static-core';
import { controller, httpGet } from 'inversify-express-utils';
import { inject } from 'inversify';

import { CsvParseError, InvalidQueryParametersException } from '../../exceptions/exception';
import { logger } from '../../utils/logger';
import { IRequestWithUser } from '../../infrastructure/user/request-with-user.interface';
import { CSVService } from '../../services/csv.service';
import { TYPES } from '../../services/config/types';

@controller('/scotland/live')
export class ScotlandLiveController {
    constructor(@inject(TYPES.CSVService) private csvService: CSVService) {}

    @httpGet('/:dataStreamName')
    public async getData(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const dataStreamName: string = request.params.dataStreamName as string;
        logger.info(`ScotlandLiveController: getData: dataStreamName = ${dataStreamName}`);

        const data: any[] = await this.csvService.getLiveData(dataStreamName);
        response.status(200).send(data);
    }
}

import {NextFunction} from 'connect';
import {Response} from 'express-serve-static-core';
import {controller, httpGet} from 'inversify-express-utils';

import { RequestWithUser } from '../../internal/auth/requestWithUser.interface';
import { CsvParseError } from '../../../exceptions/exception';
import { logger } from '../../../utils/logger';
import { readCSV } from '../../../csv/csv-reader';

@controller('/scotland/covid-deaths/data-week')
export class ScotlandCovidDeathsDataWeek {

    constructor() {}

    @httpGet('/gender-age')
    public async getGenderAge(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('ScotlandCovidDeathsDataWeek: getGenderAge:');

        try {
            const data: any[] = await readCSV('deaths-by-gender-age.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(500, error.message));
        }
    }

    @httpGet('/location')
    public async getLocation(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('ScotlandCovidDeathsDataWeek: getLocation:');

        try {
            const data: any[] = await readCSV('deaths-by-location.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(500, error.message));
        }
    }

    @httpGet('/type')
    public async getType(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('ScotlandCovidDeathsDataWeek: getType:');

        try {
            const data: any[] = await readCSV('deaths-by-type.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(500, error.message));
        }
    }


}




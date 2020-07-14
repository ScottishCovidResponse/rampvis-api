// TODO
// Deprecate

import {NextFunction} from 'connect';
import {Response} from 'express-serve-static-core';
import {controller, httpGet} from 'inversify-express-utils';

import { RequestWithUser } from '../../request-with-user.interface';
import { CsvParseError } from '../../../exceptions/exception';
import { logger } from '../../../utils/logger';
import {inject} from "inversify";
import {TYPES} from "../../../services/config/types";
import {CSVService} from "../../../services/csv.service";

@controller('/scotland/covid-deaths/data-week')
export class ScotlandCovidDeathsDataWeek {

    constructor(
        @inject(TYPES.CSVService) private csvService: CSVService
    ) {}

    @httpGet('/gender-age')
    public async getGenderAge(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('ScotlandCovidDeathsDataWeek: getGenderAge:');

        try {
            const data: any[] = await this.csvService.getData('covid_deaths_gender_age.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(error.message));
        }
    }

    @httpGet('/location')
    public async getLocation(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('ScotlandCovidDeathsDataWeek: getLocation:');

        try {
            const data: any[] = await this.csvService.getData('covid_deaths_location.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(error.message));
        }
    }

    @httpGet('/type')
    public async getType(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('ScotlandCovidDeathsDataWeek: getType:');

        try {
            const data: any[] = await this.csvService.getData('covid_deaths_type.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(error.message));
        }
    }


}




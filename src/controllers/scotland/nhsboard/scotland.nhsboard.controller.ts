import {NextFunction} from 'connect';
import {Response} from 'express-serve-static-core';
import {controller, httpGet} from 'inversify-express-utils';

import { CsvParseError } from '../../../exceptions/exception';
import { logger } from '../../../utils/logger';
import { RequestWithUser } from '../../internal/auth/requestWithUser.interface';
import { ScotlandRegionNhs } from './scotland-regions-nhs.enum';
import { readCSV } from '../../../csv/csv-reader';

@controller('/scotland')
export class ScotlandNhsboardController {

    constructor() {}

    @httpGet('/cumulative')
    public async getAllCumulative(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('ScotlandNhsboardController: getAllCumulative:');

        try {
            const data: any[] = await readCSV('cumulative_cases.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(500, error.message));
        }
    }

    @httpGet('/cumulative/:id')
    public async getCumulative(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const nhsName: ScotlandRegionNhs = request.params.id as any;
        logger.debug('ScotlandNhsboardController: getData: nhsName  = ' + nhsName);

        try {
            const data: any[] = await readCSV('cumulative_cases.csv');
            response.status(200).send(data.map((d: any) => {
                return {
                    date: d.date,
                    value: d[nhsName],
                };
            }));
        } catch (error) {
            next(new CsvParseError(500, error.message));
        }
    }

    @httpGet('/icupatients')
    public async getAllIcuPatients(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('ScotlandNhsboardController: getAllIcuPatients:');

        try {
            const data: any[] = await readCSV('icu_patients.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(500, error.message));
        }
    }

    @httpGet('/icupatients/:id')
    public async getIcuPatients(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const nhsName = request.params.id;
        logger.debug('ScotlandNhsboardController: getIcuPatients: nhsName  = ' + nhsName);

        try {
            const data: any[] = await readCSV('icu_patients.csv');
            response.status(200).send(data.map((d: any) => {
                return {
                    date: d.date,
                    value: d[nhsName],
                };
            }));
        } catch (error) {
            next(new CsvParseError(500, error.message));
        }
    }

    @httpGet('/hospconfirmed')
    public async getAllHospitalConfirmed(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('ScotlandNhsboardController: getAllHospitalConfirmed:');

        try {
            const data: any[] = await readCSV('hospital_conformed.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(500, error.message));
        }
    }

    @httpGet('/hospconfirmed/:id')
    public async getHospitalConfirmed(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const nhsName = request.params.id;
        logger.debug('ScotlandNhsboardController: getHospitalConfirmed: nhsName  = ' + nhsName);

        try {
            const data: any[] = await readCSV('hospital_conformed.csv');
            response.status(200).send(data.map((d: any) => {
                return {
                    date: d.date,
                    value: d[nhsName],
                };
            }));
        } catch (error) {
            next(new CsvParseError(500, error.message));
        }
    }

    @httpGet('/hospsuspected')
    public async getAllHospitalSuspected(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('ScotlandNhsboardController: getAllHospitalSuspected:');

        try {
            const data: any[] = await readCSV('hospital_suspected.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(500, error.message));
        }
    }

    @httpGet('/hospsuspected/:id')
    public async getHospitalSuspected(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const nhsName = request.params.id;
        logger.debug('ScotlandNhsboardController: getHospitalSuspected: nhsName  = ' + nhsName);

        try {
            const data: any[] = await readCSV('hospital_suspected.csv');
            response.status(200).send(data.map((d: any) => {
                return {
                    date: d.date,
                    value: d[nhsName],
                };
            }));
        } catch (error) {
            next(new CsvParseError(500, error.message));
        }
    }

}




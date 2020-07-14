// TODO
// Deprecate

import {NextFunction} from 'connect';
import {Response} from 'express-serve-static-core';
import {controller, httpGet} from 'inversify-express-utils';

import {CsvParseError} from '../../../exceptions/exception';
import {logger} from '../../../utils/logger';
import {RequestWithUser} from '../../request-with-user.interface';
import {ScotlandRegionNhs} from '../nhs-board.enum';
import {inject} from "inversify";
import {TYPES} from "../../../services/config/types";
import {CSVService} from "../../../services/csv.service";

@controller('/scotland')
export class ScotlandNhsboardController {

    constructor(
        @inject(TYPES.CSVService) private csvService: CSVService
    ) {
    }
    @httpGet('/cumulative')
    public async getAllCumulative(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('ScotlandNhsboardController: getAllCumulative:');

        try {
            const data: any[] = await this.csvService.getData('cumulative_cases.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(error.message));
        }
    }

    @httpGet('/cumulative/:id')
    public async getCumulative(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const id: any = request.params.id as any;
        let data: any[] = [];

        try {
            if (id === 'pearson-correlation') {
                logger.debug('ScotlandNhsboardController: getCumulative: pearson-correlation');
                data = await this.csvService.getData('cumulative_case_pearson_correlation.csv');

                response.status(200).send(data);

            } else {
                const nhsName: ScotlandRegionNhs = id;
                logger.debug('ScotlandNhsboardController: getData: nhsName  = ' + nhsName);
                data = await this.csvService.getData('cumulative_cases.csv');

                response.status(200).send(data.map((d: any) => {
                    return {
                        date: d.date,
                        value: d[nhsName],
                    };
                }));

            }
        } catch (error) {
            next(new CsvParseError(error.message));
        }
    }

    @httpGet('/icupatients')
    public async getAllIcuPatients(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('ScotlandNhsboardController: getAllIcuPatients:');

        try {
            const data: any[] = await this.csvService.getData('icu_patients.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(error.message));
        }
    }

    @httpGet('/icupatients/:id')
    public async getIcuPatients(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const nhsName = request.params.id;
        logger.debug('ScotlandNhsboardController: getIcuPatients: nhsName  = ' + nhsName);

        try {
            const data: any[] = await this.csvService.getData('icu_patients.csv');
            response.status(200).send(data.map((d: any) => {
                return {
                    date: d.date,
                    value: d[nhsName],
                };
            }));
        } catch (error) {
            next(new CsvParseError(error.message));
        }
    }

    @httpGet('/hospconfirmed')
    public async getAllHospitalConfirmed(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('ScotlandNhsboardController: getAllHospitalConfirmed:');

        try {
            const data: any[] = await this.csvService.getData('hospital_confirmed.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(error.message));
        }
    }

    @httpGet('/hospconfirmed/:id')
    public async getHospitalConfirmed(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const nhsName = request.params.id;
        logger.debug('ScotlandNhsboardController: getHospitalConfirmed: nhsName  = ' + nhsName);

        try {
            const data: any[] = await this.csvService.getData('hospital_confirmed.csv');
            response.status(200).send(data.map((d: any) => {
                return {
                    date: d.date,
                    value: d[nhsName],
                };
            }));
        } catch (error) {
            next(new CsvParseError(error.message));
        }
    }

    @httpGet('/hospsuspected')
    public async getAllHospitalSuspected(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('ScotlandNhsboardController: getAllHospitalSuspected:');

        try {
            const data: any[] = await this.csvService.getData('hospital_suspected.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(error.message));
        }
    }

    @httpGet('/hospsuspected/:id')
    public async getHospitalSuspected(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const nhsName = request.params.id;
        logger.debug('ScotlandNhsboardController: getHospitalSuspected: nhsName  = ' + nhsName);

        try {
            const data: any[] = await this.csvService.getData('hospital_suspected.csv');
            response.status(200).send(data.map((d: any) => {
                return {
                    date: d.date,
                    value: d[nhsName],
                };
            }));
        } catch (error) {
            next(new CsvParseError(error.message));
        }
    }

}




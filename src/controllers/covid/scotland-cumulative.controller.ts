import {NextFunction} from 'connect';
import {Response} from 'express-serve-static-core';
import {controller, httpGet} from 'inversify-express-utils';

import * as csv from 'fast-csv';
import * as fs from 'fs';
import * as path from 'path';

import {CsvParseError} from '../../exceptions/exception';
import {logger} from '../../utils/logger';
import {RequestWithUser} from '../internal/auth/requestWithUser.interface';
import {ScotlandRegionNhs} from './scotland-regions-nhs.enum';

@controller('/scotland')
export class ScotlandCumulativeController {

    constructor() {}

    @httpGet('/cumulative/:id')
    public async getCumulative(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const nhsName: ScotlandRegionNhs = request.params.id as any;
        logger.debug('ScotlandCumulativeController: getData: nhsName  = ' + nhsName);

        try {
            const data: any[] = await this.readCSV('cumulative_cases.csv');
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

    @httpGet('/icupatients/:id')
    public async getIcuPatients(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const nhsName = request.params.id;
        logger.debug('ScotlandCumulativeController: getIcuPatients: nhsName  = ' + nhsName);

        try {
            const data: any[] = await this.readCSV('icu_patients.csv');
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

    @httpGet('/hospconfirmed/:id')
    public async getHospitalConfirmed(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const nhsName = request.params.id;
        logger.debug('ScotlandCumulativeController: getHospitalConfirmed: nhsName  = ' + nhsName);

        try {
            const data: any[] = await this.readCSV('hospital_conformed.csv');
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

    @httpGet('/hospsuspected/:id')
    public async getHospitalSuspected(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const nhsName = request.params.id;
        logger.debug('ScotlandCumulativeController: getHospitalSuspected: nhsName  = ' + nhsName);

        try {
            const data: any[] = await this.readCSV('hospital_suspected.csv');
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


    private readCSV(fileName: string): Promise<any[]> {
        return new Promise((resolve: any) => {
            const returnLit: any[] = [];

            const stream = fs.createReadStream(path.resolve(__dirname, '', fileName))
                .pipe(csv.parse({headers: true}));

            stream.on('error', (error: any) => {
                console.error(error);
            });

            stream.on('data', (row: any) => {
                // console.log(row);
                returnLit.push(row);
            });

            stream.on('end', (rowCount: number) => {
                console.log(`Parsed ${rowCount} rows`);
                resolve(returnLit);
            });
        });
    }


}




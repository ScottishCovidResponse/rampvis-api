import * as csv from 'fast-csv';
import fs from 'fs';
import path from 'path';
import { provide } from "inversify-binding-decorators";
import config from 'config';

import { TYPES } from "./config/types";
import { logger } from '../utils/logger';


@provide(TYPES.CSVService)
export class CSVService {

    PATH_DATA_V04 = '../../../data/v04';
    PATH_DATA_V04_DYNAMIC = '../../../data/v04-dynamic';
    PATH_DATA_LIVE = '../../../data/live';

    public constructor() {
    }


    public async getLiveData(dataStreamName: string) {
        logger.info(`CSVService: getLiveData: dataStreamName = ${dataStreamName}`);
        return await this.readCSV(this.PATH_DATA_LIVE, `${dataStreamName}.csv`);
    }

    public async getDataV04(fileName: string): Promise<any[]> {
        console.log('CSVService: getDataV04: fileName = ', fileName);
        return await this.readCSV(this.PATH_DATA_V04, fileName);
    }

    public async getDynamicDataV04(fileName: string): Promise<any[]> {
        const filePath = this.PATH_DATA_V04_DYNAMIC;
        return await this.readCSV(filePath, fileName);
    }

    private readCSV(filePath: string, fileName: string): Promise<any[]> {
        return new Promise((resolve: any, reject: any) => {
            const returnLit: any[] = [];

            const file = path.resolve(__dirname, filePath, fileName);
            logger.info(`CSVService: readCSV: file = ${JSON.stringify(file)}`);


            const readStream = fs.createReadStream(file)
            const parseStream = readStream.pipe(csv.parse({ headers: true }));

            readStream.on('error', (error: any) => {
                reject({ message: `CSV read error ${JSON.stringify(error)}` });
            });

            parseStream.on('error', (error: any) => {
                reject({ message: `CSV parse error ${JSON.stringify(error)}` });
            });

            parseStream.on('data', (row: any) => {
                // console.log('CSVService: readCSV: row = ', row);
                let cleanedRow = CSVService.clean(row);
                // console.log('CSVService: readCSV: cleanedRow = ', cleanedRow);
                returnLit.push(cleanedRow);
            });

            parseStream.on('end', (rowCount: number) => {
                resolve(returnLit);
            });

        });

    }

    public static clean(obj: any) {
        Object.keys(obj).forEach((key) => {
            if (obj[key] === null || obj[key] === '*' || obj[key] === '' || obj[key] === ' ' || obj[key] === 'N/A') {
                obj[key] = '0';
            }
        });

        return obj;
    }

}

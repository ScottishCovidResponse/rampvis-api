import * as csv from 'fast-csv';
import fs from 'fs';
import path from 'path';
import { provide } from 'inversify-binding-decorators';
import config from 'config';

import { TYPES } from './config/types';
import { logger } from '../utils/logger';
import { MODEL } from '../infrastructure/onto-data/onto-data-types';
import { FileNotAvailableError, CsvParseError } from '../exceptions/exception';

@provide(TYPES.CSVService)
export class CSVService {
    PATH_DATA_V04 = '../../../data/v04';
    PATH_DATA_V04_DYNAMIC = '../../../data/v04-dynamic';
    PATH_DATA_LIVE = '../../../data/live';
    PATH_SCOTLAND_MODEL = '../../../data/scotland/model';

    public constructor() {}

    public async getScotlandModelData(modelName: MODEL, component: string) {
        const fileName = `${modelName}-${component}.csv`;
        logger.info(`CSVService: getModelData: fileName = ${fileName}`);
        return await this.readCSV(this.PATH_SCOTLAND_MODEL, fileName);
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
            if (!fs.existsSync(file)) {
                logger.error(`CSVService: readCSV: file ${JSON.stringify(file)} is not available`);
                throw new FileNotAvailableError(`File ${file} is not available`);
            }
            logger.info(`CSVService: readCSV: file = ${JSON.stringify(file)}`);

            const readStream = fs.createReadStream(file);
            let parseStream = readStream.pipe(csv.parse({ headers: true }));
          
            readStream.on('error', (error: any) => {
                logger.error(`CSVService: readCSV: CSV read error = ${JSON.stringify(error)}`);
                throw new CsvParseError(`CSV read error ${JSON.stringify(error)}`);
            });

            parseStream.on('error', (error: any) => {
                logger.error(`CSVService: readCSV: CSV parse error = ${JSON.stringify(error)}`);
                throw new CsvParseError(`CSV parse error ${JSON.stringify(error)}`);
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

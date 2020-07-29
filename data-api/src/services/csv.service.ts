import * as csv from 'fast-csv';
import fs from 'fs';
import path from 'path';
import {provide} from "inversify-binding-decorators";
import {TYPES} from "./config/types";

@provide(TYPES.CSVService)
export class CSVService {

    CSV_DATA_PATH = '../../../csv-data/scotland'
    CSV_DYNAMIC_DATA_PATH = '../../../csv-data-dynamic/scotland'

    public constructor() {
    }

    public async getData(fileName: string): Promise<any[]> {
        const filePath = this.CSV_DATA_PATH;
        console.log('CSVService: getData: file = ', path.resolve(__dirname, filePath, fileName));
        return await this.readCSV(filePath, fileName);
    }

    public async getDynamicData(fileName: string): Promise<any[]> {
        const filePath = this.CSV_DYNAMIC_DATA_PATH;
        return await this.readCSV(filePath, fileName);
    }

    private readCSV(filePath: string, fileName: string): Promise<any[]> {
        return new Promise((resolve: any, reject: any) => {
            const returnLit: any[] = [];

            const readStream = fs.createReadStream(path.resolve(__dirname, filePath, fileName))
            const parseStream = readStream.pipe(csv.parse({headers: true}));

            readStream.on('error', (error: any) => {
                reject({message: `CSV read error ${JSON.stringify(error)}`});
            });

            parseStream.on('error', (error: any) => {
                reject({message: `CSV parse error ${JSON.stringify(error)}`});
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

import fs from "fs";
import path from "path";
import * as csv from "fast-csv";

function readCSV(fileName: string): Promise<any[]> {
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
    })
}

export { readCSV }

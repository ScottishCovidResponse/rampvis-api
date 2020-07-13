import {NextFunction} from 'connect';
import {Response} from 'express-serve-static-core';
import {controller, httpGet} from 'inversify-express-utils';

import {CsvParseError, InvalidQueryParametersException} from '../../exceptions/exception';
import {logger} from '../../utils/logger';
import {RequestWithUser} from '../request-with-user.interface';
import {readDynamicCSV} from '../../services/csv.service';

@controller('/scotland_dynamic/nhs-board')
export class NhsBoardDynamicController {

    constructor() {
    }

    //
    // api/v1/scotland_dynamic/?table=<>
    // api/v1/scotland_dynamic/?table=<>&region=<>
    //
    @httpGet('/')
    public async getNhsBoardData(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const table = request.query.table as string;
        const region = request.query.region as string;
        logger.info('RegionDataController: getTableData: table = ', table, ', region = ', region);

        if (!table && !region) {
            return next(new InvalidQueryParametersException('Empty table and region'));
        }

        try {
            const data: any[] = await readDynamicCSV(table + '.csv');

            if (request.query.region) {
                response.status(200).send(data.map((d: any) => {
                    return {
                        date: d.date,
                        value: parseFloat(d[region].replace(/,/g, '')),
                    };
                }));
            } else {
                response.status(200).send(data);
            }
        } catch (error) {
            next(new CsvParseError(500, error.message));
        }
    }
}




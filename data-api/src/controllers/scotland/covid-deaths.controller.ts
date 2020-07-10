import {NextFunction} from 'connect';
import {Response} from 'express-serve-static-core';
import {controller, httpGet} from 'inversify-express-utils';

import { RequestWithUser } from '../request-with-user.interface';
import { CsvParseError } from '../../exceptions/exception';
import { logger } from '../../utils/logger';
import { readCSV } from '../../services/csv.service';

@controller('/scotland/covid-deaths')
export class CovidDeathsController {

    constructor() {}

    //
    // /api/v1/scotland/covid-deaths?table=<>&group=<>,
    //
    @httpGet('/')
    public async getCovidDeathsData(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const table = request.query.table as string;
        const group = request.query.group as string;
        logger.info('CovidDeathsController: getCovidDeathsData: table = ', table, ', group = ', group);

        try {
            const data: any[] = await readCSV(table + '_' + group + '.csv');
            response.status(200).send(data);
        } catch (error) {
            next(new CsvParseError(500, error.message));
        }

    }

}


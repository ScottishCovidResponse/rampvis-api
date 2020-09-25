import {NextFunction} from 'connect';
import {Response} from 'express-serve-static-core';
import {controller, httpGet} from 'inversify-express-utils';
import {inject} from "inversify";

import {CsvParseError, InvalidQueryParametersException} from '../../../exceptions/exception';
import {logger} from '../../../utils/logger';
import {RequestWithUser} from '../../../infrastructure/entities/request-with-user.interface';
import {TYPES} from "../../../services/config/types";
import {CSVService} from "../../../services/csv.service";

@controller('/scotland_dynamic/nhs-board')
export class NhsBoardDynamicController {

    constructor(
        @inject(TYPES.CSVService) private csvService: CSVService
    ) {}

    //
    // api/v1/scotland_dynamic/nhs-board/?table=<>
    // api/v1/scotland_dynamic/nhs-board/?table=<>&region=<>
    //
    @httpGet('/')
    public async getNhsBoardData(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const table = request.query.table as string;
        const region = request.query.region as string;
        logger.info('NhsBoardDynamicController: getNhsBoardData: table = ', table, ', region = ', region);

        if (!table && !region) {
            return next(new InvalidQueryParametersException('Empty table and region'));
        }

        try {
            const data: any[] = await this.csvService.getDynamicData(table + '.csv');

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
            console.log('error = ', error.message)
            next(new CsvParseError(error.message));
        }
    }
}




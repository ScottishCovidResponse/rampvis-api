import {NextFunction} from 'connect';
import {Response} from 'express-serve-static-core';
import {controller, httpGet} from 'inversify-express-utils';

import {CsvParseError, InvalidQueryParametersException} from '../../../exceptions/exception';
import {logger} from '../../../utils/logger';
import {RequestWithUser} from '../../../infrastructure/entities/request-with-user.interface';
import {CSVService} from '../../../services/csv.service';
import {inject} from "inversify";
import {TYPES} from "../../../services/config/types";

@controller('/v2/scotland/nhs-board')
export class NhsBoardController {

    constructor(
        @inject(TYPES.CSVService) private csvService: CSVService
    ) {}

    //
    // api/v1/scotland/?table=<>
    // api/v1/scotland/?table=<>&region=<>
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
            const data: any[] = await this.csvService.getData(table + '.csv');

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
            next(new CsvParseError(error.message));
        }
    }
}




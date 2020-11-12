import { NextFunction } from 'connect';
import { Response } from 'express-serve-static-core';
import { controller, httpGet } from 'inversify-express-utils';
import { inject } from 'inversify';

import { logger } from '../../utils/logger';
import { IRequestWithUser } from '../../infrastructure/user/request-with-user.interface';
import { CSVService } from '../../services/csv.service';
import { TYPES } from '../../services/config/types';
import { MODEL } from '../../infrastructure/onto-data/onto-data-types';

@controller('/scotland/model')
export class ScotlandCovidModelController {
    constructor(@inject(TYPES.CSVService) private csvService: CSVService) {}

    //
    // modelName: MODEL
    //
    @httpGet('/:modelName/:component')
    public async getModelComponent(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const modelName: MODEL = request.params.modelName as MODEL;
        const component: string = request.params.component as string;
        logger.info( `ScotlandCovidModelController: getModelComponent: modelName = ${modelName}, component = ${component}`, );

        const data: any[] = await this.csvService.getScotlandModelData(modelName, component);
        response.status(200).send(data);
    }
}

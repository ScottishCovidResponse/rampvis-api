import { NextFunction, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet } from 'inversify-express-utils';

import { PaginationVm } from '../infrastructure/view-model/pagination.vm';
import { queryParamValidate } from '../middleware/dto.validate';
import { UserToken } from '../security/user.token';
import { TYPES } from '../services/config/types';
import { logger } from '../utils/logger';
import { RequestWithUser } from './request-with-user.interface';
 import { ActivityFilterVm } from '../infrastructure/view-model/activity-filters.vm';
import { ActivityDto } from '../infrastructure/dto/activity.dto';
import {ActivityService} from "../services/activity.service";

@controller('/internal/activities', UserToken.verify)
export class ActivityControllerInt {

    constructor(@inject(TYPES.ActivityService) private activityService: ActivityService) {
    }

    @httpGet('/', queryParamValidate(ActivityFilterVm))
    public async getAllActivities(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug(`ActivityControllerInt: getAllActivities: request.user = ${JSON.stringify(request.user)}`);
        const query: ActivityFilterVm = request.query as any;

        const result: PaginationVm<ActivityDto> = await this.activityService.getActivities(query);
        logger.debug('ActivityControllerInt: getAllActivities: result = ' + JSON.stringify(result));
        response.status(200).send(result);
    }

}

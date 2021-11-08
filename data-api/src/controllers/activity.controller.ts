import { NextFunction, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet } from 'inversify-express-utils';

import { PaginationVm } from '../infrastructure/pagination.vm';
import { queryParamValidate } from '../middleware/validators';
import { JwtToken } from '../middleware/jwt.token';
import { TYPES } from '../services/config/types';
import { logger } from '../utils/logger';
import { ActivityService } from '../services/activity.service';
import { IRequestWithUser } from '../infrastructure/user/request-with-user.interface';
import { ActivityFilterVm } from '../infrastructure/activity/activity-filter.vm';
import { ActivityDto } from '../infrastructure/activity/activity.dto';

@controller('/activities', JwtToken.verify)
export class ActivityController {
    constructor(@inject(TYPES.ActivityService) private activityService: ActivityService) {}

    @httpGet('/', queryParamValidate(ActivityFilterVm))
    public async getAllActivities(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug(`ActivityController: getAllActivities: request.user = ${JSON.stringify(request.user)}`);
        const query: ActivityFilterVm = request.query as any;

        const result: PaginationVm<ActivityDto> = await this.activityService.getActivities(query);
        logger.debug('ActivityController: getAllActivities: result = ' + JSON.stringify(result));
        response.status(200).send(result);
    }
}

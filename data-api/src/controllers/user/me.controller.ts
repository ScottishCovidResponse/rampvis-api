import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import { NextFunction } from 'connect';
import { Response } from 'express-serve-static-core';
import { inject } from 'inversify';

import { TYPES } from '../../services/config/types';
import { IUser } from '../../infrastructure/user/user.interface';
import { JwtToken } from '../../middleware/jwt.token';
import { logger } from '../../utils/logger';
import { SomethingWentWrong } from '../../exceptions/exception';
import { UserVm } from '../../infrastructure/user/user.vm';
import { MAPPING_TYPES } from '../../services/config/automapper.config';
import { UserService } from '../../services/user.service';
import { ActivityService } from '../../services/activity.service';
import { IRequestWithUser } from '../../infrastructure/user/request-with-user.interface';
import { ACTIVITY_TYPE } from '../../infrastructure/activity/activity.interface';
import { ACTIVITY_ACTION } from '../../infrastructure/activity/activity.interface';
import { vmValidate } from '../../middleware/validators';
import { UserDto } from '../../infrastructure/user/user.dto';
import { BookmarkVm } from '../../infrastructure/bookmark.vm';

@controller('/me', JwtToken.verify)
export class MeController {
    constructor(
        @inject(TYPES.UserService) private userService: UserService,
        @inject(TYPES.ActivityService) private activityService: ActivityService
    ) {}

    @httpGet('/')
    public async getUser(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const user: IUser = <IUser>request.user;
        const userId: string= user._id.toString();
        logger.debug('MeController: getUser: request.user = ', JSON.stringify(request.user) , ', read userId = ', userId );

        try {
        const result: IUser = await this.userService.getUser(userId);
        const resultDto: UserDto = automapper.map(MAPPING_TYPES.IUser, MAPPING_TYPES.UserDto, result);
        logger.debug('MeController: getUser: resultDto = ' + JSON.stringify(resultDto));
        response.status(200).send(resultDto);
        } catch (error) {
            next(new SomethingWentWrong(error.message));
        }
    }

    @httpPost('/bookmark',  vmValidate(BookmarkVm))
    public async bookmark(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const { pageId, status } = request.body;
        const user: IUser = <IUser>request.user;
        const userId: string= user._id.toString();
        logger.debug('MeController: bookmark: userId = ', userId, 'pageId =', pageId, ", status =", status);

        try {
            const result: IUser = status ? await this.userService.bookmarkPage(userId, pageId)
                                        : await this.userService.unbookmarkPage(userId, pageId);

            const resultDto: UserDto = automapper.map(MAPPING_TYPES.IUser, MAPPING_TYPES.UserDto, result);
            await this.activityService.createActivity(
                user,
                ACTIVITY_TYPE.BOOKMARK,
                ACTIVITY_ACTION.CREATE,
                userId
            );
            response.status(200).send(resultDto);
        } catch (error) {
            next(new SomethingWentWrong(error.message));
        }
    }
}

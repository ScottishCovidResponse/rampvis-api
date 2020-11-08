import { NextFunction } from 'connect';
import { Response } from 'express-serve-static-core';
import { inject } from 'inversify';
import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import multer from 'multer';

import { IUser } from '../infrastructure/user/user.interface';
import { JwtToken } from '../middleware/jwt.token';
import { TYPES } from '../services/config/types';
import { ERROR_CODES } from '../exceptions/error.codes';
import { ObjectNotFoundException } from '../exceptions/exception';
import { ActivityService } from '../services/activity.service';
import { MAPPING_TYPES } from '../services/config/automapper.config';
import { ThumbnailService } from '../services/thumbnail.service';
import { UserService } from '../services/user.service';
import { logger } from '../utils/logger';
import { IRequestWithUser } from '../infrastructure/user/request-with-user.interface';
import { ACTIVITY_TYPE, ACTIVITY_ACTION } from '../infrastructure/activity/activity.interface';

const upload = multer();

@controller('/thumbnail', JwtToken.verify)
export class ThumbnailController {
    constructor(
        @inject(TYPES.UserService) private userService: UserService,
        @inject(TYPES.ActivityService) private activityService: ActivityService,
        @inject(TYPES.ThumbnailService) private thumbnailService: ThumbnailService,
    ) {}

    //
    // Thumbnail
    //

    @httpPost('/', upload.single('file')) // dtoValidate(BookmarkDto) - body - form-data
    public async createThumbnail(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const user: IUser = request.user as IUser;
        const thumbnail = request.file as any;

        logger.debug('ThumbnailController: createThumbnail: request.user = ' + JSON.stringify(request.user));
        console.log('ThumbnailController: createThumbnail: thumbnail = \n', thumbnail);

        const result = await this.userService.getUser(user._id as string);
        if (!result) {
            return next(new ObjectNotFoundException(ERROR_CODES.USER_NOT_FOUND));
        } else {
            const result: any = await this.thumbnailService.saveThumbnail(thumbnail);
            await this.activityService.createActivity(
                user,
                ACTIVITY_TYPE.BOOKMARK,
                ACTIVITY_ACTION.CREATE,
                user._id.toString(),
            );

            response.status(200).send(result);
        }
    }

    @httpGet('/:pageId')
    public async getThumbnail(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const user: IUser = request.user as IUser;
        const pageId = request.params.pageId;

        logger.debug('BookmarkController: getBookmarkInfo: request.user = ' + JSON.stringify(request.user));

        const result = await this.userService.getUser(user._id as string);
        if (!result) {
            next(new ObjectNotFoundException(ERROR_CODES.USER_NOT_FOUND));
        } else {
            const result: any = await this.thumbnailService.getThumbnail(pageId);
            response.status(200).send(result);
        }
    }
}

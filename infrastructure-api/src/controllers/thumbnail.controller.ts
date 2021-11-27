import { NextFunction } from 'connect';
import { Response } from 'express-serve-static-core';
import { inject } from 'inversify';
import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import multer from 'multer';

import { IUser } from '../infrastructure/user/user.interface';
import { JwtToken } from '../middleware/jwt.token';
import { TYPES } from '../services/config/types';
import { ThumbnailService } from '../services/thumbnail.service';
import { logger } from '../utils/logger';
import { IRequestWithUser } from '../infrastructure/user/request-with-user.interface';
import { ThumbnailDto } from '../infrastructure/thumbnail/thumbnail.dto';
import { MAPPING_TYPES } from '../services/config/automapper.config';
import { IThumbnail } from '../infrastructure/thumbnail/thumbnail.interface';
import { ActivityService } from '../services/activity.service';
import { ACTIVITY_TYPE } from '../infrastructure/activity/activity.interface';
import { ACTIVITY_ACTION } from '../infrastructure/activity/activity.interface';
import { SomethingWentWrong } from '../exceptions/exception';

const upload = multer();

@controller('/thumbnail', JwtToken.verify)
export class ThumbnailController {
    constructor(
        @inject(TYPES.ThumbnailService) private thumbnailService: ThumbnailService,
        @inject(TYPES.ActivityService) private activityService: ActivityService
    ) {}

    @httpPost('/', upload.single('file')) // dtoValidate(ThumbnailDto) - body - form-data
    public async createThumbnail(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const user: IUser = request.user as IUser;
        const thumbnail = request.file as any;
        logger.debug('ThumbnailController: createThumbnail: request.user = ' + JSON.stringify(request.user));
        console.log('ThumbnailController: createThumbnail: thumbnail = \n', thumbnail);

        try {
            const result: IThumbnail = await this.thumbnailService.saveThumbnail(thumbnail);
            await this.activityService.createActivity(
                user,
                ACTIVITY_TYPE.THUMBNAIL,
                ACTIVITY_ACTION.CREATE,
                user._id.toString()
            );
            const resultDto: ThumbnailDto = automapper.map(
                MAPPING_TYPES.IThumbnail,
                MAPPING_TYPES.ThumbnailDto,
                result
            );
            response.status(200).send(resultDto);
        } catch (error: any) {
            next(new SomethingWentWrong(error.message));
        }
    }

    @httpGet('/:pageId')
    public async getThumbnail(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const user: IUser = request.user as IUser;
        const pageId = request.params.pageId;
        logger.debug('ThumbnailController: getThumbnailInfo: request.user = ' + JSON.stringify(request.user));
        try {
            const result: IThumbnail = await this.thumbnailService.getThumbnail(pageId);
            const resultDto: ThumbnailDto = automapper.map(
                MAPPING_TYPES.IThumbnail,
                MAPPING_TYPES.ThumbnailDto,
                result
            );
            response.status(200).send(result);
        } catch (error: any) {
            next(new SomethingWentWrong(error.message));
        }
    }

    @httpDelete('/:pageId')
    public async deleteThumbnail(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const user: IUser = <IUser>request.user;
        const pageId = request.params.pageId;
        logger.debug('ThumbnailController: deleteThumbnail: request.user = ' + JSON.stringify(request.user));

        try {
            const result: IThumbnail = await this.thumbnailService.deleteThumbnail(pageId);
            const resultDto: ThumbnailDto = automapper.map(
                MAPPING_TYPES.IThumbnail,
                MAPPING_TYPES.ThumbnailDto,
                result
            );

            await this.activityService.createActivity(
                user,
                ACTIVITY_TYPE.THUMBNAIL,
                ACTIVITY_ACTION.DELETE,
                user._id.toString()
            );

            response.status(200).send(resultDto);
        } catch (error: any) {
            next(new SomethingWentWrong(error.message));
        }
    }
}

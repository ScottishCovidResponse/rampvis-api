import {NextFunction} from 'connect';
import {Response} from 'express-serve-static-core';
import {inject} from 'inversify';
import {controller, httpDelete, httpGet, httpPost, httpPut} from 'inversify-express-utils';
import multer from 'multer';

import {IUser} from '../infrastructure/entities/user.interface';
import {UserToken} from '../security/user.token';
import {TYPES} from '../services/config/types';
import {RequestWithUser} from './request-with-user.interface';

import {ERROR_CODES} from '../exceptions/error.codes';
import {ObjectNotFoundException} from '../exceptions/exception';
import {BookmarkDto} from '../infrastructure/dto/bookmark.dto';
import {ACTIVITY_ACTION, ACTIVITY_TYPE} from '../infrastructure/entities/activity.interface';
import {ActivityService} from '../services/activity.service';
import {MAPPING_TYPES} from '../services/config/automapper.config';
import {ThumbnailService} from '../services/thumbnail.service';
import {UserService} from '../services/user.service';
import {logger} from '../utils/logger';

const upload = multer();

@controller('/thumbnail', UserToken.verify)
export class ThumbnailController {


    constructor(@inject(TYPES.UserService) private userService: UserService,
                @inject(TYPES.ActivityService) private activityService: ActivityService,
                @inject(TYPES.ThumbnailService) private thumbnailService: ThumbnailService,
    ) {
    }

    //
    // Thumbnail
    //

    @httpPost('/', upload.single('file')) // dtoValidate(BookmarkDto) - body - form-data
    public async createThumbnail(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const user: IUser = request.user as IUser;
        const thumbnail = request.file as any;

        logger.debug('ThumbnailController: createThumbnail: request.user = ' + JSON.stringify(request.user));
        console.log('ThumbnailController: createThumbnail: thumbnail = \n', thumbnail);

        const result = await this.userService.getUser(user._id as string);
        if (!result) {
            return next(new ObjectNotFoundException(ERROR_CODES.USER_NOT_FOUND));
        } else {
            const result: any = await this.thumbnailService.saveThumbnail(thumbnail);
            await this.activityService.createActivity(user, ACTIVITY_TYPE.BOOKMARK, ACTIVITY_ACTION.CREATE, user._id.toString());

            response.status(200).send(result);
        }

    }

    @httpGet('/:pageId')
    public async getBookmarkInfo(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const user: IUser = request.user as IUser;
        const pageId = request.params.pageId;

        logger.debug('BookmarkController: getBookmarkInfo: request.user = ' + JSON.stringify(request.user));

        const result = await this.userService.getUser(user._id as string);
        if (!result) {
            next(new ObjectNotFoundException(ERROR_CODES.USER_NOT_FOUND));
        } else {
            const result: any = await this.thumbnailService.getThumbnail(pageId);
            // const resultDto: BookmarkDto[] = automapper.map(MAPPING_TYPES.IBookmark, MAPPING_TYPES.BookmarkDto, result);

            await this.activityService.createActivity(user, ACTIVITY_TYPE.BOOKMARK, ACTIVITY_ACTION.READ, user._id.toString());
            response.status(200).send(result);
        }
    }

}

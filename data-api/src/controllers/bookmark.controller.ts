import {controller, httpDelete, httpGet, httpPost, httpPut} from 'inversify-express-utils';
import {NextFunction} from 'connect';
import {Response} from 'express-serve-static-core';
import {inject} from 'inversify';
import multer from 'multer';

import {TYPES} from '../services/config/types';
import {IUser} from '../infrastructure/entities/user.interface';
import {RequestWithUser} from './request-with-user.interface';
import {UserToken} from '../security/user.token';

import {logger} from '../utils/logger';
import {ObjectNotFoundException} from '../exceptions/exception';
import {dtoValidate} from '../middleware/dto.validate';
import {MAPPING_TYPES} from '../services/config/automapper.config';
import {ACTIVITY_TYPE, ACTIVITY_ACTION} from '../infrastructure/entities/activity.interface';
import {UserService} from "../services/user.service";
import {ActivityService} from "../services/activity.service";
import {BookmarkDto} from "../infrastructure/dto/bookmark.dto";
import {ERROR_CODES} from "../exceptions/error.codes";
import {IBookmark} from "../infrastructure/entities/bookmark.interface";
import {BookmarkService} from "../services/bookmark.service";

const upload = multer();

@controller('/bookmark', UserToken.verify)
export class BookmarkController {


    constructor(@inject(TYPES.UserService) private userService: UserService,
                @inject(TYPES.ActivityService) private activityService: ActivityService,
                @inject(TYPES.BookmarkService) private bookmarkService: BookmarkService,
    ) {
    }

    //
    // Bookmarks
    //

    @httpPost('/', upload.single('thumbnail')) // dtoValidate(BookmarkDto) - body - form-data
    public async createBookmark(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const bookmarkDto: BookmarkDto = <any>request.body;
        const user: IUser = <IUser>request.user;
        bookmarkDto.thumbnail = <any> request.file;

        logger.debug('BookmarkController: createBookmark: request.user = ' + JSON.stringify(request.user)
            + ', create bookmarkDto = ', bookmarkDto);

        const result = await this.userService.getUser(<string>user._id);
        if (!result) {
            next(new ObjectNotFoundException(ERROR_CODES.USER_NOT_FOUND));
        } else {
            const result: IBookmark = await this.bookmarkService.saveBookmark(bookmarkDto, user);
            // TODO debug
            // const resultDto: BookmarkDto = automapper.map(MAPPING_TYPES.IBookmark, MAPPING_TYPES.BookmarkDto, result);
            await this.activityService.createActivity(user, ACTIVITY_TYPE.BOOKMARK, ACTIVITY_ACTION.CREATE, user._id.toString());

            response.status(200).send(result);
        }

    }

    @httpGet('/')
    public async getAllBookmarks(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const user: IUser = <IUser>request.user;

        logger.debug('BookmarkController: getAllBookmarks: request.user = ' + JSON.stringify(request.user));

        const result = await this.userService.getUser(<string>user._id);
        if (!result) {
            next(new ObjectNotFoundException(ERROR_CODES.USER_NOT_FOUND));
        } else {
            const result: IBookmark[] = await this.bookmarkService.getAllBookmarks(user);
            // const resultDto: BookmarkDto[] = automapper.map(MAPPING_TYPES.IBookmark, MAPPING_TYPES.BookmarkDto, result);

            await this.activityService.createActivity(user, ACTIVITY_TYPE.BOOKMARK, ACTIVITY_ACTION.READ, user._id.toString());

            response.status(200).send(result);
        }
    }

    @httpDelete('/:id')
    public async removeBookmark(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const user: IUser = <IUser>request.user;
        const bookmarkId = request.params.id;

        logger.debug('BookmarkController: getAllBookmarks: request.user = ' + JSON.stringify(request.user));

        const result = await this.userService.getUser(<string>user._id);
        if (!result) {
            next(new ObjectNotFoundException(ERROR_CODES.USER_NOT_FOUND));
        } else {
            const result: IBookmark = await this.bookmarkService.deleteBookmark(bookmarkId);
            // const resultDto: BookmarkDto = automapper.map(MAPPING_TYPES.IBookmark, MAPPING_TYPES.BookmarkDto, result);

            await this.activityService.createActivity(user, ACTIVITY_TYPE.BOOKMARK, ACTIVITY_ACTION.DELETE, user._id.toString());

            response.status(200).send(result);
        }
    }

}

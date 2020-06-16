import {controller, httpGet, httpPost, httpPut} from 'inversify-express-utils';
import {NextFunction} from 'connect';
import {Response} from 'express-serve-static-core';
import {inject} from 'inversify';

import {IUserService} from '../../../services/interfaces/user.service.interface';
import {TYPES} from '../../../services/config/types';
import {IUser} from '../../../infrastructure/entities/user.interface';
import {RequestWithUser} from '../auth/requestWithUser.interface';
import {UserToken} from '../../../security/user.token';
import {
    canReadAll,
    canRead,
    canCreate,
    canDelete,
    canUpdateAll,
    canUpdatePassword,
    canUpdatePhone
} from './userAccess.verify';
import {logger} from '../../../utils/logger';
import {DatabaseException, UserWithEmailAlreadyExistsException} from '../../../exceptions/exception';
import {dtoValidate} from '../../../middleware/dto.validate';
import {UserDto} from '../../../infrastructure/dto/user.dto';
import {UpdateUserDto} from '../../../infrastructure/dto/updateUser.dto';
import {MAPPING_TYPES} from '../../../services/config/automapper.config';
import {UpdatePasswordDto} from '../../../infrastructure/dto/updatePassword.dto';
import {ACTIVITY_TYPE, ACTIVITY_ACTION} from '../../../infrastructure/entities/activity.interface';
import {IActivityService} from '../../../services/interfaces/activity.service.interface';


@controller('/internal/users', UserToken.verify)
export class UserController {


    constructor(@inject(TYPES.IUserService) private userService: IUserService,
                @inject(TYPES.IActivityService) private activityService: IActivityService) {
    }


    @httpGet('/', canReadAll)
    public async getAllUsers(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('UserController: getAllUsers: request.user = ' + JSON.stringify(request.user));

        const result: Array<IUser> = await this.userService.getAllUsers();
        const resultDto: Array<UserDto> = automapper.map(MAPPING_TYPES.User, MAPPING_TYPES.UserDto, result);
        logger.debug(`UserController: getAllUsers: resultDto = ${JSON.stringify(resultDto)}`);
        response.status(200).send(resultDto);
    }


    @httpGet('/:id', canRead)
    public async getUser(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const userId = request.params.id;
        logger.debug('UserController: getUser: request.user = ' + JSON.stringify(request.user) + ', read userId = ' + userId);

        const result: IUser = await this.userService.getUser(userId);
        const resultDto: UserDto = automapper.map(MAPPING_TYPES.User, MAPPING_TYPES.UserDto, result);
        logger.debug('UserController: getUser: resultDto = ' + JSON.stringify(resultDto));
        response.status(200).send(resultDto);
    }


    @httpPost('/', dtoValidate(UserDto), canCreate)
    public async createUser(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const userDto: UserDto = request.body;
        const user: IUser = request.user as IUser;
        logger.debug('UserController: createUser: request.user = ' + JSON.stringify(request.user) + ', create userDto = ' + JSON.stringify(userDto));

        try {
            const result = await this.userService.findByEmail(userDto.email);
            if (result) {
                next(new UserWithEmailAlreadyExistsException(result.email));
            } else {
                try {
                    userDto.createdAt = new Date();

                    const result: IUser = await this.userService.saveUser(userDto);
                    const resultDto: UserDto = automapper.map(MAPPING_TYPES.User, MAPPING_TYPES.UserDto, result);

                    await this.activityService.createActivity(user, ACTIVITY_TYPE.USER, ACTIVITY_ACTION.CREATE, result._id.toString());

                    response.status(200).send(resultDto);
                } catch (error) {
                    throw new DatabaseException(500, error.message);
                }
            }
        } catch (error) {
            next(new DatabaseException(500, error.message));
        }
    }


    @httpPut('/:id/password', dtoValidate(UpdatePasswordDto), canUpdatePassword)
    public async updateOwnPassword(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const userId = request.params.id;
        const newPassword = request.body.newPassword;
        const oldPassword = request.body.oldPassword;
        logger.debug('UserController: updatePassword: request.user = ' + JSON.stringify(request.user) + ', update userId = ' + userId);

        try {
            const result = await this.userService.updatePassword(userId, oldPassword, newPassword);
            const resultDto: UserDto = automapper.map(MAPPING_TYPES.User, MAPPING_TYPES.UserDto, result);
            logger.debug('UserController: getUser: resultDto = ' + JSON.stringify(resultDto));
            response.status(200).send(resultDto);
        } catch (error) {
            next(new DatabaseException(500, error.message));
        }
    }


    @httpPut('/:id/phone/:phone', canUpdatePhone)
    public async updatePhone(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const userId = request.params.id;
        const phone = request.params.phone;
        logger.debug('UserController: updatePhone: request.user = ' + JSON.stringify(request.user) + ', update userId = ' + userId);

        try {
            const result = await this.userService.updatePhone(userId, phone);
            const resultDto: UserDto = automapper.map(MAPPING_TYPES.User, MAPPING_TYPES.UserDto, result);
            logger.debug('UserController: getUser: resultDto = ' + JSON.stringify(resultDto));
            response.status(200).send(resultDto);
        } catch (error) {
            next(new DatabaseException(500, error.message));
        }
    }


    @httpPut('/:id', dtoValidate(UpdateUserDto), canUpdateAll)
    public async updateUser(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const userId = request.params.id;
        const updateUserDto: UpdateUserDto = request.body;
        const user: IUser = request.user as IUser;
        logger.debug('UserController: updateUser: request.user = ' + JSON.stringify(request.user) + ', update userId = ' + userId);

        try {
            const result = await this.userService.updateUser(userId, updateUserDto);
            const resultDto: UserDto = automapper.map(MAPPING_TYPES.User, MAPPING_TYPES.UserDto, result);
            logger.debug('UserController: getUser: resultDto = ' + JSON.stringify(resultDto));

            await this.activityService.createActivity(user, ACTIVITY_TYPE.USER, ACTIVITY_ACTION.UPDATE, result._id.toString());

            response.status(200).send(resultDto);
        } catch (error) {
            next(new DatabaseException(500, error.message));
        }
    }


    @httpPut('/state/:id', canDelete)
    public async enableOrDisableUser(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const userId = request.params.id;
        const user: IUser = request.user as IUser;
        logger.debug('UserController: enableOrDisableUser: request.user = ' + JSON.stringify(request.user) + ', userId = ' + userId);

        try {
            const result: IUser = await this.userService.enableOrDisableUser(userId);
            const resultDto: UserDto = automapper.map(MAPPING_TYPES.User, MAPPING_TYPES.UserDto, result);

            await this.activityService.createActivity(user, ACTIVITY_TYPE.USER, ACTIVITY_ACTION.REMOVE, result._id.toString());

            response.status(200).send(resultDto);
        } catch (error) {
            next(new DatabaseException(500, error.message));
        }
    }

}
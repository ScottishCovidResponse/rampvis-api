import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import { NextFunction } from 'connect';
import { Response } from 'express-serve-static-core';
import { inject } from 'inversify';

import { TYPES } from '../../services/config/types';
import { IUser } from '../../infrastructure/user/user.interface';
import { JwtToken } from '../../middleware/jwt.token';

import { logger } from '../../utils/logger';
import { SomethingWentWrong, UserWithEmailAlreadyExistsException } from '../../exceptions/exception';
import { vmValidate } from '../../middleware/validators';
import { UserVm } from '../../infrastructure/user/user.vm';
import { UpdateUserVm } from '../../infrastructure/user/update-user.vm';
import { MAPPING_TYPES } from '../../services/config/automapper.config';
import { UpdatePasswordVm } from '../../infrastructure/user/update-password.vm';
import { UserService } from '../../services/user.service';
import { ActivityService } from '../../services/activity.service';
import { IRequestWithUser } from '../../infrastructure/user/request-with-user.interface';
import { ACTIVITY_TYPE } from '../../infrastructure/activity/activity.interface';
import { ACTIVITY_ACTION } from '../../infrastructure/activity/activity.interface';
import { UserDto } from '../../infrastructure/user/user.dto';

//
// Admin should only be allowed
//

@controller('', JwtToken.verify)
export class UserController {
    constructor(
        @inject(TYPES.UserService) private userService: UserService,
        @inject(TYPES.ActivityService) private activityService: ActivityService
    ) {}

    @httpGet('/users')
    public async getAllUsers(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        logger.debug('UserController: getAllUsers: request.user = ' + JSON.stringify(request.user));

        const result: Array<IUser> = await this.userService.getAllUsers();
        const resultDto: Array<UserDto> = automapper.map(MAPPING_TYPES.IUser, MAPPING_TYPES.UserDto, result);
        logger.debug(`UserController: getAllUsers: resultDto = ${JSON.stringify(resultDto)}`);
        response.status(200).send(resultDto);
    }

    @httpGet('/user/:userId')
    public async getUser(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const userId = request.params.userId;
        const user: IUser = <IUser>request.user;
        logger.debug(
            'UserController: getUser: request.user = ',
            JSON.stringify(request.user),
            ', read userId = ',
            userId
        );

        try {
            const result: IUser = await this.userService.getUser(userId);
            const resultDto: UserDto = automapper.map(MAPPING_TYPES.IUser, MAPPING_TYPES.UserDto, result);
            logger.debug('UserController: getUser: resultDto = ' + JSON.stringify(resultDto));
            response.status(200).send(resultDto);
        } catch (error: any) {
            next(new SomethingWentWrong(error.message));
        }
    }

    @httpPost('/user', vmValidate(UserVm))
    public async createUser(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const userDto: UserVm = request.body;
        const user: IUser = request.user as IUser;
        logger.debug(
            'UserController: createUser: request.user = ' +
                JSON.stringify(request.user) +
                ', create userDto = ' +
                JSON.stringify(userDto)
        );

        try {
            const result = await this.userService.findByEmail(<string>userDto.email);
            if (result) {
                next(new UserWithEmailAlreadyExistsException(<string>result.email));
            } else {
                try {
                    userDto.createdAt = new Date();

                    const result: IUser = await this.userService.saveUser(userDto);
                    const resultDto: UserVm = automapper.map(MAPPING_TYPES.IUser, MAPPING_TYPES.UserDto, result);

                    await this.activityService.createActivity(
                        user,
                        ACTIVITY_TYPE.USER,
                        ACTIVITY_ACTION.CREATE,
                        result._id.toString()
                    );

                    response.status(200).send(resultDto);
                } catch (error: any) {
                    throw new SomethingWentWrong(error.message);
                }
            }
        } catch (error: any) {
            next(new SomethingWentWrong(error.message));
        }
    }

    @httpPut('/user/:userId/password', vmValidate(UpdatePasswordVm))
    public async updateOwnPassword(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const userId = request.params.userId;
        const newPassword = request.body.newPassword;
        const oldPassword = request.body.oldPassword;
        logger.debug(
            'UserController: updatePassword: request.user = ' +
                JSON.stringify(request.user) +
                ', update userId = ' +
                userId
        );

        try {
            const result = await this.userService.updatePassword(userId, oldPassword, newPassword);
            const resultDto: UserVm = automapper.map(MAPPING_TYPES.IUser, MAPPING_TYPES.UserDto, result);
            logger.debug('UserController: getUser: resultDto = ' + JSON.stringify(resultDto));
            response.status(200).send(resultDto);
        } catch (error: any) {
            next(new SomethingWentWrong(error.message));
        }
    }

    @httpPut('/user/:userId', vmValidate(UpdateUserVm))
    public async updateUser(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const userId = request.params.userId;
        const updateUserDto: UpdateUserVm = request.body;
        const user: IUser = request.user as IUser;
        logger.debug(
            'UserController: updateUser: request.user = ' + JSON.stringify(request.user) + ', update userId = ' + userId
        );

        try {
            const result = await this.userService.updateUser(userId, updateUserDto);
            const resultDto: UserVm = automapper.map(MAPPING_TYPES.IUser, MAPPING_TYPES.UserDto, result);
            logger.debug('UserController: getUser: resultDto = ' + JSON.stringify(resultDto));

            await this.activityService.createActivity(
                user,
                ACTIVITY_TYPE.USER,
                ACTIVITY_ACTION.UPDATE,
                result._id.toString()
            );

            response.status(200).send(resultDto);
        } catch (error: any) {
            next(new SomethingWentWrong(error.message));
        }
    }

    @httpPut('/user/state/:userId')
    public async enableOrDisableUser(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const userId = request.params.userId;
        const user: IUser = request.user as IUser;
        logger.debug(
            'UserController: enableOrDisableUser: request.user = ' +
                JSON.stringify(request.user) +
                ', userId = ' +
                userId
        );

        try {
            const result: IUser = await this.userService.enableOrDisableUser(userId);
            const resultDto: UserVm = automapper.map(MAPPING_TYPES.IUser, MAPPING_TYPES.UserDto, result);

            await this.activityService.createActivity(
                user,
                ACTIVITY_TYPE.USER,
                ACTIVITY_ACTION.DELETE,
                result._id.toString()
            );

            response.status(200).send(resultDto);
        } catch (error: any) {
            next(new SomethingWentWrong(error.message));
        }
    }
}

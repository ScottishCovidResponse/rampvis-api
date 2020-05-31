import * as bcrypt from 'bcryptjs';
import { controller, httpPost } from 'inversify-express-utils';
import { TYPES } from '../../../services/config/types';
import { inject } from 'inversify';
import { NextFunction } from 'connect';
import { Response } from 'express-serve-static-core';

import { RequestWithUser } from './requestWithUser.interface';
import { WrongCredentialsException } from '../../../exceptions/exception';
import { dtoValidate } from '../../../middleware/dto.validate';
import { LoginDto } from '../../../infrastructure/dto/login.dto';
import { UserToken } from '../../../security/user.token';
import { ITokenData } from '../../../security/token-data.interface';
import { IUserService } from '../../../services/interfaces/user.service.interface';
import { IActivityService } from '../../../services/interfaces/activity.service.interface';
import { ACTIVITY_TYPE, ACTIVITY_ACTION } from '../../../infrastructure/entities/activity.interface';
import {logger} from "../../../utils/logger";

@controller('/internal/auth')
export class UserAuthController {

    constructor(@inject(TYPES.IUserService) private userService: IUserService,
                @inject(TYPES.IActivityService) private activityService: IActivityService) {
    }

    @httpPost('/login', dtoValidate(LoginDto))
    public async login(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const loginData: LoginDto = request.body;

        logger.error('UserAuthController: login: loginData = ', loginData);

        const user = await this.userService.getLoggedInUser(loginData.email);

        logger.error('UserAuthController: login: user = ', user);

        if (user) {
            const isPasswordMatching = await bcrypt.compare(loginData.password, user.password);
            if (isPasswordMatching) {
                user.password = "";
                const permissions = await UserToken.getAllGrants(user.role);
                const tokenData: ITokenData = UserToken.create(user, permissions);

                await this.activityService.createActivity(user, ACTIVITY_TYPE.USER, ACTIVITY_ACTION.LOGIN, user._id.toString());

                response.status(200).send(tokenData);
            } else {
                next(new WrongCredentialsException(loginData.email));
            }
        } else {
            next(new WrongCredentialsException(loginData.email));
        }

    }

}

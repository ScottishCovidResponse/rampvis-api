import * as bcrypt from 'bcryptjs';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { TYPES } from '../services/config/types';
import { inject } from 'inversify';
import { NextFunction } from 'connect';
import { Request, Response } from 'express-serve-static-core';
import config from 'config';
import passport from 'passport';

import { RequestWithUser } from './../infrastructure/entities/request-with-user.interface';
import { WrongCredentialsException } from '../exceptions/exception';
import { vmValidate } from '../middleware/validators';
import { LoginDto } from '../infrastructure/dto/login.dto';
import { JwtToken } from '../middleware/jwt.token';
import { ITokenData } from '../infrastructure/token/token-data.interface';
import { ACTIVITY_TYPE, ACTIVITY_ACTION } from '../infrastructure/entities/activity.interface';
import { logger } from '../utils/logger';
import { UserService } from '../services/user.service';
import { ActivityService } from '../services/activity.service';
import { GitHubLoginDto } from '../infrastructure/dto/github-login.dto';
import { UserDto } from '../infrastructure/dto/user.dto';
import { IUser } from '../infrastructure/entities/user.interface';

@controller('/auth')
export class AuthController {
    constructor(
        @inject(TYPES.UserService) private userService: UserService,
        @inject(TYPES.ActivityService) private activityService: ActivityService,
    ) {}

    //
    // GitHub OAuth
    //
    @httpGet('/github-login', passport.authenticate('github'))
    @httpGet(
        '/github-callback',
        passport.authenticate('github', { failureRedirect: `${config.get('github.failureRedirect')}` }),
    )
    public async githubCallback(request: Request, response: Response, next: NextFunction): Promise<void> {
        const currentUser = (request as any).currentUser;
        logger.debug('AuthController: callback: currentUser = ', currentUser);

        const tokenData: ITokenData = JwtToken.create(currentUser, null);

        response.redirect(`${config.get('github.successRedirect')}/?token=${tokenData.token}`);
    }

    //
    // user/pass
    //
    @httpPost('/login', vmValidate(LoginDto))
    public async login(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const loginData: LoginDto = request.body as any;

        logger.error('AuthController: login: loginData = ', loginData);

        const user: IUser = await this.userService.getLoggedInUser(loginData.email);

        logger.error('AuthController: login: user = ', user);

        if (user) {
            const isPasswordMatching = await bcrypt.compare(loginData.password, user.password as string);
            if (isPasswordMatching) {
                user.password = '';
                const permissions = await JwtToken.getAllGrants(user.role);
                const tokenData: ITokenData = JwtToken.create(user, permissions);

                await this.activityService.createActivity(
                    user,
                    ACTIVITY_TYPE.USER,
                    ACTIVITY_ACTION.LOGIN,
                    user._id.toString(),
                );

                response.status(200).send(tokenData);
            } else {
                next(new WrongCredentialsException(loginData.email));
            }
        } else {
            next(new WrongCredentialsException(loginData.email));
        }
    }
}

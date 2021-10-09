import * as bcrypt from 'bcryptjs';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { TYPES } from '../../services/config/types';
import { inject } from 'inversify';
import { NextFunction } from 'connect';
import { Request, Response } from 'express-serve-static-core';
import config from 'config';
import passport from 'passport';

import { IRequestWithUser } from '../../infrastructure/user/request-with-user.interface';
import { WrongCredentialsException } from '../../exceptions/exception';
import { vmValidate } from '../../middleware/validators';
import { LoginVm } from '../../infrastructure/user/login.vm';
import { JwtToken } from '../../middleware/jwt.token';
import { ITokenData } from '../../infrastructure/token/token-data.interface';
import { logger } from '../../utils/logger';
import { UserService } from '../../services/user.service';
import { ActivityService } from '../../services/activity.service';
import { IUser } from '../../infrastructure/user/user.interface';
import { ACTIVITY_TYPE } from '../../infrastructure/activity/activity.interface';
import { ACTIVITY_ACTION } from '../../infrastructure/activity/activity.interface';

@controller('/auth')
export class AuthController {
    constructor(
        @inject(TYPES.UserService) private userService: UserService,
        @inject(TYPES.ActivityService) private activityService: ActivityService
    ) {}

    //
    // GitHub OAuth
    //
    @httpGet('/github-login', passport.authenticate('github'))
    @httpGet(
        '/github-callback',
        passport.authenticate('github', { failureRedirect: `${config.get('github.failureRedirect')}` })
    )
    public async githubCallback(request: Request, response: Response, next: NextFunction): Promise<void> {
        const currentUser = (request as any).currentUser;
        logger.info('AuthController: callback: currentUser = ', currentUser);

        const tokenData: ITokenData = await JwtToken.create(currentUser);
        response.redirect(`${config.get('github.successRedirect')}/?token=${tokenData.token}`);
    }

    //
    // user/pass
    //
    @httpPost('/login', vmValidate(LoginVm))
    public async login(request: IRequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const loginData: LoginVm = request.body as any;
        logger.debug('AuthController: login: loginData = ', loginData);

        const user: IUser = await this.userService.getLoggedInUser(loginData.email);
        logger.debug('AuthController: login: user = ', user);
        console.log('user', user);

        if (!user) {
            next(new WrongCredentialsException(loginData.email));
            return;
        }

        const isMatch = await bcrypt.compare(loginData.password, user.password as string);
        console.log('isMatch', isMatch);

        if (!isMatch) {
            next(new WrongCredentialsException(loginData.email));
            return;
        }

        try {
            const tokenData: ITokenData = await JwtToken.create(user);

            await this.activityService.createActivity(
                user,
                ACTIVITY_TYPE.USER,
                ACTIVITY_ACTION.LOGIN,
                user._id.toString()
            );

            user.password = '';
            response.status(200).send(tokenData);
        } catch (e) {
            next(new WrongCredentialsException(JSON.stringify(e)));
        }
    }
}

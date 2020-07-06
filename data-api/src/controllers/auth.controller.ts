import * as bcrypt from 'bcryptjs';
import {controller, httpGet, httpPost} from 'inversify-express-utils';
import { TYPES } from '../services/config/types';
import { inject } from 'inversify';
import { NextFunction } from 'connect';
import { Request, Response } from 'express-serve-static-core';
import config from "config";
import passport from "passport";

import { RequestWithUser } from './request-with-user.interface';
import { WrongCredentialsException } from '../exceptions/exception';
import { dtoValidate } from '../middleware/dto.validate';
import { LoginDto } from '../infrastructure/dto/login.dto';
import { UserToken } from '../security/user.token';
import { ITokenData } from '../security/token-data.interface';
import { ACTIVITY_TYPE, ACTIVITY_ACTION } from '../infrastructure/entities/activity.interface';
import {logger} from "../utils/logger";
import {UserService} from "../services/user.service";
import {ActivityService} from "../services/activity.service";
import {GitHubLoginDto} from "../infrastructure/dto/github-login.dto";
import {UserDto} from "../infrastructure/dto/user.dto";
import {IUser} from "../infrastructure/entities/user.interface";

@controller('/auth')
export class AuthController {

    constructor(@inject(TYPES.UserService) private userService: UserService,
                @inject(TYPES.ActivityService) private activityService: ActivityService) {
    }

    @httpGet('/github-login', passport.authenticate('github'))

    @httpGet('/github-callback', passport.authenticate('github', { failureRedirect: `${config.get('github.failureRedirect')}` }))
    public async githubCallback(request: Request, response: Response, next: NextFunction): Promise<void> {
        const currentUser = (request as any).currentUser;
        logger.debug('AuthController: callback: currentUser = ', currentUser);

        const tokenData: ITokenData = UserToken.create(currentUser, null);

        response.redirect(`${config.get('github.successRedirect')}/?token=${tokenData.token}`)
    }


    //
    // TODO, unsecured and to be deprecated
    // Login with GitHubLoginDto
    //
    @httpPost('/github', dtoValidate(GitHubLoginDto))
    public async auth(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const data: UserDto = request.body as any;

        logger.error('AuthController: auth: data = ', data);

        let user: IUser = await this.userService.getGitHubUser(<string>data.githubId);

        if (!user) {
            user = await this.userService.saveGitHubUser(data);
            await this.activityService.createActivity(user, ACTIVITY_TYPE.USER, ACTIVITY_ACTION.CREATE, user._id.toString());
            logger.error('AuthController: auth: created user = ', user);
        } else {
            await this.activityService.createActivity(user, ACTIVITY_TYPE.USER, ACTIVITY_ACTION.LOGIN, user._id.toString());
            logger.error('AuthController: auth: login user = ', user);
        }

        // const permissions = await UserToken.getAllGrants(user.role);
        const tokenData: ITokenData = UserToken.create(user, null);
        response.status(200).send(tokenData);
    }




    @httpPost('/login', dtoValidate(LoginDto))
    public async login(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {
        const loginData: LoginDto = request.body as any;

        logger.error('AuthController: login: loginData = ', loginData);

        const user: IUser = await this.userService.getLoggedInUser(loginData.email);

        logger.error('AuthController: login: user = ', user);

        if (user) {
            const isPasswordMatching = await bcrypt.compare(loginData.password, user.password as string);
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

import config from 'config';
import { NextFunction, Response } from 'express';
import fs from 'fs';
import * as jwt from 'jsonwebtoken';
import moment from 'moment';
import util from 'util';

import { AuthenticationTokenMissingException, WrongAuthenticationTokenException } from '../exceptions/exception';
import { IUser } from '../infrastructure/entities/user.interface';
import { TYPES } from '../services/config/types';
import { logger } from '../utils/logger';
import { IDataStoredInToken } from '../infrastructure/entities/data-stored-in-token.interface';
import { ITokenData } from '../infrastructure/token/token-data.interface';
import {UserService} from "../services/user.service";
import {RequestWithUser} from '../infrastructure/entities/request-with-user.interface';
import { DIContainer } from '../services/config/inversify.config';

export class JwtToken {
  private static jwtSign = util.promisify(jwt.sign);
  private static jwtVerify = util.promisify(jwt.verify);

  private static RSA_PVT_KEY: string = fs.readFileSync(config.get('jwt.pvtKey'), 'utf8');
  private static RSA_PUB_KEY: string = fs.readFileSync(config.get('jwt.pubKey'), 'utf8');

  constructor() {
  }

  public static create(user: IUser, permissions: any): ITokenData {
    const start = user.createdAt ? moment(user.createdAt) : moment();
    // If expiry lastPostDate is missing, create a month valid token
    const end = user.expireOn ? moment(user.expireOn) : moment().add(1, 'months');
    const expInDays: string = moment.duration(end.diff(start)).asDays() + 'd';

    logger.debug(`JwtToken: create: expiresIn = ${expInDays}, user = ${JSON.stringify(user)}`);

    const dataStoredInToken: IDataStoredInToken = {
      id: user._id as string,
      role: user.role,
      permissions: permissions,
    };

    // RS256 accepts public and private key
    const token = jwt.sign({ ...dataStoredInToken }, this.RSA_PVT_KEY, { algorithm: config.get('jwt.algorithm'), expiresIn: expInDays });

    return {
      expireOn: user.expireOn,
      token: token,
    } as ITokenData;
  }

  public static async verify(request: RequestWithUser, response: Response, next: NextFunction) {
    const authorizationHeader = request.headers.authorization;
    logger.debug(`JwtToken: verify: authorizationHeader = ${authorizationHeader}`);

    if (!authorizationHeader) {
      return next(new AuthenticationTokenMissingException());
    }

    const token = authorizationHeader.split(' ')[1]; // Bearer <token>
    let userId: string;

    try {
      const verificationResponse = await JwtToken.jwtVerify(token, JwtToken.RSA_PUB_KEY) as IDataStoredInToken;
      userId = verificationResponse.id;
      logger.debug('JwtToken: verify: DataStoredInToken = ' + JSON.stringify(verificationResponse));
    } catch (error) {
      logger.debug(`JwtToken: verify: error = ${error.message}`);
      return next(new WrongAuthenticationTokenException());
    }

    //try {
      logger.debug(`JwtToken: call user service id = ${userId}`);


      const userService: UserService = DIContainer.get<UserService>(TYPES.UserService);
      const user: IUser = await userService.get(userId);

      if (user) {
        request.user = user;
        next();
      } else {
        next(new WrongAuthenticationTokenException());
      }
  }

  public static async getAllGrants(role: string) {
    return null
  }

}


import config from "config";
import { NextFunction, Response } from "express";
import { readFileSync } from "fs";
import * as jwt from "jsonwebtoken";
import moment from "moment";
import util from "util";

import { AuthenticationTokenMissingException, WrongAuthenticationTokenException } from "../exceptions/exception";
import { IUser } from "../infrastructure/user/user.interface";
import { TYPES } from "../services/config/types";
import { logger } from "../utils/logger";
import { IDataStoredInToken } from "../infrastructure/token/data-stored-in-token.interface";
import { ITokenData } from "../infrastructure/token/token-data.interface";
import { UserService } from "../services/user.service";
import { IRequestWithUser } from "../infrastructure/user/request-with-user.interface";
import { DIContainer } from "../services/config/inversify.config";
import { ROLES } from "../infrastructure/user/roles.enum";
import { getUserGrants } from "../controllers/user/user.access";

function readPvtkey() {
  let key: string = config.get("jwt.pvtKey");
  try {
    return readFileSync(key, "utf8");
  } catch (e) {
    logger.error(`JwtToken: error reading private key = ${key}, error = ${e}`);
    process.exit();
  }
}

function readPubkey() {
  let key: string = config.get("jwt.pubKey");
  try {
    return readFileSync(key, "utf8");
  } catch (e) {
    logger.error(`JwtToken: error reading public key = ${key}, error = ${e}`);
    process.exit();
  }
}

export class JwtToken {
  private static RSA_PVT_KEY: string = readPvtkey() as string;
  private static RSA_PUB_KEY: string = readPubkey() as string;

  constructor() {}

  public static async create(user: IUser): Promise<ITokenData> {
    const start = user.createdAt ? moment(user.createdAt) : moment();
    // If expiry lastPostDate is missing, create a month valid token
    const end = user.expireOn ? moment(user.expireOn) : moment().add(1, "months");
    const expInDays: string = moment.duration(end.diff(start)).asDays() + "d";

    logger.debug(`JwtToken: create: expiresIn = ${expInDays}, user = ${JSON.stringify(user)}`);

    const role = user.role ? user.role : ROLES.USER;
    const dataStoredInToken: IDataStoredInToken = {
      id: user._id as string,
      role: role,
      permissions: await JwtToken.getAllGrants(role),
    };

    // RS256 accepts public and private key
    const token = jwt.sign({ ...dataStoredInToken }, JwtToken.RSA_PVT_KEY, {
      algorithm: config.get("jwt.algorithm"),
      expiresIn: expInDays,
    });

    return {
      expireOn: user.expireOn,
      token: token,
    } as ITokenData;
  }

  public static async verify(request: IRequestWithUser, response: Response, next: NextFunction) {
    const authorizationHeader = request.headers.authorization;
    logger.debug(`JwtToken: verify: authorizationHeader = ${authorizationHeader}`);

    if (!authorizationHeader) {
      return next(new AuthenticationTokenMissingException());
    }

    const token = authorizationHeader.split(" ")[1]; // Bearer <token>
    let userId: string;

    try {
      const verificationResponse: any = jwt.verify(token, JwtToken.RSA_PUB_KEY);
      userId = verificationResponse?.id;
      logger.debug("JwtToken: verify: DataStoredInToken = " + JSON.stringify(verificationResponse));
    } catch (error: any) {
      logger.debug(`JwtToken: verify: error = ${error?.message}`);
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
    const userGrants = await getUserGrants(role);
    return { ...userGrants };
  }
}

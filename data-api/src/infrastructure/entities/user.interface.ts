import { ObjectId } from 'bson';

import { IAddress } from './address.interface';

export interface IUser {
    _id: string | ObjectId;
    name?: string;
    email?: string;
    createdAt?: Date;
    phone?: string;
    password?: string;
    expireOn?: Date;
    address?: IAddress;

    githubId?: string,
    githubLogin?: string,

    role: ACCOUNT_ROLES;

    deleted?: boolean;
}

export enum ACCOUNT_ROLES {
    ADMIN = 'admin',
    USER = 'user',
    DEVELOPER = 'developer',
}

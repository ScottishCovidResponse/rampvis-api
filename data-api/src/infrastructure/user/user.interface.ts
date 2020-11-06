import { ObjectId } from 'bson';
import { ROLES } from './roles.enum';

export interface IUser {
    _id: string | ObjectId;
    name?: string;
    email?: string;
    createdAt?: Date;
    password?: string;
    expireOn?: Date;

    githubId?: string,
    githubUsername?: string,

    role: ROLES;
    deleted?: boolean;
}
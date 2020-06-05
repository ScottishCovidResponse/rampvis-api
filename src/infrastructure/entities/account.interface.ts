import { ObjectId } from 'bson';

import { IAddress } from './address.interface';

export interface IAccount {
  _id: string | ObjectId;
  name: string;
  email: string;
  createdAt: Date;
  phone: string;
  role: ACCOUNT_ROLES;
  password: string;
  expireOn?: Date;
  address?: IAddress;
}

export enum ACCOUNT_ROLES {
  ADMIN = 'admin',
  USER = 'user',
  DEVELOPER = 'developer',
}

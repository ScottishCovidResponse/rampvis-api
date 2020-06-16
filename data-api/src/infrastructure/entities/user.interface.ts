import { IAccount } from './account.interface';

export interface IUser extends IAccount {
    deleted: boolean;
}

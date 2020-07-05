import { ObjectId } from 'bson';
import { ACCOUNT_ROLES } from './user.interface';

export interface IActivity {
    _id: string | ObjectId;
    type: ACTIVITY_TYPE;
    action: ACTIVITY_ACTION;
    objectId: string;       // Represent the id of the object for which the activity is generated, e.g., userId
    createdAt: Date;
    accountId: string;
    accountRole: ACCOUNT_ROLES;
}

export enum ACTIVITY_TYPE {
    USER = 'user',
    BOOKMARK = 'bookmark',
}

export enum ACTIVITY_ACTION {
    CREATE = 'create',
    UPDATE = 'update',
    READ = 'read',
    DELETE = 'delete',
    LOGIN = 'login',

}

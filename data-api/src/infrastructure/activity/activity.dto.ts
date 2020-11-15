import { ACTIVITY_ACTION, ACTIVITY_TYPE } from './activity.interface';
import { ROLES } from '../user/roles.enum';

export class ActivityDto {
    public id: string = '';
    public type: ACTIVITY_TYPE = undefined as any;
    public action: ACTIVITY_ACTION = undefined as any;
    public objectId: string = '';
    public createdAt?: Date = undefined;
    // user
    public name: string = '';
    public role: ROLES = undefined as any;
}

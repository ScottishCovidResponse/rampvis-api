import { ActivityDto } from '../../infrastructure/dto/activity.dto';
import { IAccount } from '../../infrastructure/entities/account.interface';
import { IActivity, ACTIVITY_ACTION, ACTIVITY_TYPE } from '../../infrastructure/entities/activity.interface';
import { ActivityFilterVm } from '../../infrastructure/view-model/activity-filters.vm';
import { PaginationVm } from '../../infrastructure/view-model/pagination.vm';
import { IService } from '../service.interface';

export interface IActivityService extends IService<IActivity> {
    getActivities(activityFilterVm: ActivityFilterVm): Promise<PaginationVm<ActivityDto>>;
    createActivity(account: IAccount, type: ACTIVITY_TYPE, action: ACTIVITY_ACTION, objectId: string): Promise<IActivity | void>;
    removeActivitiesOfAccount(accountId: string): Promise<number>;
}

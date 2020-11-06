import { FilterQuery, ObjectId } from 'mongodb';
import config from 'config';
import { inject } from 'inversify';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { DataService } from './data.service';
import { TYPES } from './config/types';
import { IUser } from '../infrastructure/entities/user.interface';
import { PaginationVm } from '../infrastructure/view-model/pagination.vm';
import { IActivity, ACTIVITY_TYPE, ACTIVITY_ACTION } from '../infrastructure/entities/activity.interface';
import { ActivityFilterVm } from '../infrastructure/view-model/activity-filters.vm';
import { ActivityDto } from '../infrastructure/dto/activity.dto';
import { provide } from 'inversify-binding-decorators';
import { UserService } from './user.service';
import { logger } from '../utils/logger';

@provide(TYPES.ActivityService)
export class ActivityService extends DataService<IActivity> {
    public constructor(
        @inject(TYPES.DbClient) dbClient: DbClient,
        @inject(TYPES.UserService) private userService: UserService,
    ) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.activities'));
    }

    async createActivity( user: IUser, type: ACTIVITY_TYPE, action: ACTIVITY_ACTION, objectId: string): Promise<IActivity | void> {
        try {
            const activity: IActivity = {
                _id: new ObjectId(),
                type: type,
                action: action,
                objectId: objectId,
                createdAt: new Date(),
                accountId: user._id.toString(),
                accountRole: user.role,
            };

            return await this.create(activity);
        } catch (error) {
            logger.error(error);
        }
    }

    async removeActivitiesOfAccount(accountId: string): Promise<number> {
        const result = await this.getDbCollection().deleteMany({ accountId: accountId } as FilterQuery<IActivity>);
        return result.deletedCount as number;
    }

    // TODO
    async getActivities(activityFilterVm: ActivityFilterVm): Promise<PaginationVm<ActivityDto>> {
        return Promise.resolve([] as any);
    }
}

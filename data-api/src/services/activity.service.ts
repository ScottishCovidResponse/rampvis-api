import config from 'config';
import { inject, injectable } from 'inversify';
import { provide } from 'inversify-binding-decorators';
import { FilterQuery, ObjectId } from 'mongodb';

import { ActivityFilterVm } from '../infrastructure/activity/activity-filter.vm';
import { ACTIVITY_ACTION, ACTIVITY_TYPE, IActivity } from '../infrastructure/activity/activity.interface';
import { DbClient } from '../infrastructure/db/mongodb.connection';
import { IUser } from '../infrastructure/user/user.interface';
import { logger } from '../utils/logger';
import { MAPPING_TYPES } from './config/automapper.config';
import { TYPES } from './config/types';
import { DataService } from './data.service';
import { UserService } from './user.service';
import { PaginationVm } from '../infrastructure/pagination.vm';
import { ActivityDto } from '../infrastructure/activity/activity.dto';

@provide(TYPES.ActivityService)
export class ActivityService extends DataService<IActivity> {
    public constructor(@inject(TYPES.DbClient) dbClient: DbClient, @inject(TYPES.UserService) private userService: UserService) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.activities'));
    }

    public async getActivities(activityFilterVm: ActivityFilterVm): Promise<PaginationVm<ActivityDto>> {
        const page: number = activityFilterVm.page ? parseInt(activityFilterVm.page, 10) : 0;
        const pageCount: number = activityFilterVm.pageCount ? parseInt(activityFilterVm.pageCount, 10) : 1;
        let filter: string = activityFilterVm.filter || '';
        const query: FilterQuery<IActivity> = {};

        return new Promise<PaginationVm<ActivityDto>>(async (resolve) => {
            if (filter.length > 0) {
                filter = filter.toLowerCase();
                query.$or = [{ type: new RegExp(filter, 'i') }, { action: new RegExp(filter, 'i') }];
            }

            const activitiesCount: number = await this.getDbCollection().find(query).count();
            // console.log('query = ', query, '\nactivitiesCount = ', activitiesCount);

            await this.getDbCollection()
                .find(query)
                .sort({ createdAt: -1 })
                .skip(pageCount * page)
                .limit(pageCount)
                .toArray(async (err, activities) => {
                    if (err) {
                        throw err;
                    }

                    const users: IUser[] = await this.userService.getUsers(activities.filter((a) => this.userService.isUser(a.role)).map((a) => a.userId));
                    const activitiesDtos: ActivityDto[] = automapper.map(MAPPING_TYPES.IActivity, MAPPING_TYPES.ActivityDto, activities);

                    activitiesDtos.forEach((activityDto: ActivityDto) => {
                        const activity = activities.find((a) => a._id.toString() === activityDto.id.toString());
                        if (activity) {
                            const user = users.find((u) => u._id.toString() === activity.userId.toString());
                            activityDto.name = <string>(user ? user.name : '');
                        }
                    });

                    resolve({ data: activitiesDtos, page, pageCount, totalCount: activitiesCount } as PaginationVm<ActivityDto>);
                });
        });
    }

    public async createActivity(user: IUser, type: ACTIVITY_TYPE, action: ACTIVITY_ACTION, objectId: string): Promise<IActivity | void> {
        try {
            const activity: IActivity = {
                _id: new ObjectId(),
                type,
                action,
                objectId,
                createdAt: new Date(),
                userId: user._id.toString(),
                role: user.role,
            };

            return await this.create(activity);
        } catch (error) {
            logger.error(error);
        }
    }

    public async removeActivitiesOfAccount(accountId: string): Promise<number> {
        const result = await this.getDbCollection().deleteMany({ userId: accountId } as FilterQuery<IActivity>);
        return result.deletedCount as number;
    }
}

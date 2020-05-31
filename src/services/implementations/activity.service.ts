import { FilterQuery, ObjectId } from "mongodb";
import config from 'config';
import { logger } from "../../utils/logger";

import { DbClient } from "../../infrastructure/db/mongodb.connection";
import { injectable, inject } from "inversify";
import { DataService } from "../data.service";
import { TYPES } from "../config/types";
import { IUser } from "../../infrastructure/entities/user.interface";
import { IUserService } from "../interfaces/user.service.interface";
import { PaginationVm } from "../../infrastructure/view-model/pagination.vm";
import { IActivity, ACTIVITY_TYPE, ACTIVITY_ACTION } from "../../infrastructure/entities/activity.interface";
import { IActivityService } from "../interfaces/activity.service.interface";
import { ActivityFilterVm } from "../../infrastructure/view-model/activity-filters.vm";
import { ActivityDto } from "../../infrastructure/dto/activity.dto";
import { IAccount } from "../../infrastructure/entities/account.interface";

@injectable()
export class ActivityService extends DataService<IActivity> implements IActivityService {
    public constructor(
        @inject(TYPES.DbClient) dbClient: DbClient,
        @inject(TYPES.IUserService) private userService: IUserService,
    ) {
        super(
            dbClient,
            config.get('mongodb.internal.db'),
            config.get('mongodb.internal.collection.activities')
        );
    }


    async getActivities(activityFilterVm: ActivityFilterVm): Promise<PaginationVm<ActivityDto>> {
        const page: number = activityFilterVm.page ? parseInt(activityFilterVm.page) : 0;
        let pageCount: number = activityFilterVm.pageCount ? parseInt(activityFilterVm.pageCount) : 1;
        let filter: string = activityFilterVm.filter || "";
        let query: FilterQuery<IActivity> = { };

        return new Promise<PaginationVm<ActivityDto>>(async (resolve) => {

            if (filter.length > 0) {
                filter = filter.toLowerCase();
                query.$or = [
                    { type: new RegExp(filter, 'i') },
                    { action: new RegExp(filter, 'i') }
                ]
            }

            if (activityFilterVm.startDt && activityFilterVm.endDt) {
                const startDate: Date = new Date(activityFilterVm.startDt);
                const endDate: Date = new Date(activityFilterVm.endDt);
                query.createdAt = { $gte: startDate, $lte: endDate }
            }

            const activitiesCount: number = await this.getCollection()
                .find(query).count();

            await this.getCollection()
                .find(query)
                .sort({ createdAt: -1 })
                .skip(pageCount * page)
                .limit(pageCount)
                .toArray(async (err, activities) => {
                    if (err) {
                        throw err;
                    }

                    // TODO
                });

        });
    }

    async createActivity(account: IAccount, type: ACTIVITY_TYPE, action: ACTIVITY_ACTION, objectId: string): Promise<IActivity | void> {
        try {
            const activity: IActivity = {
                _id: new ObjectId(),
                type: type,
                action: action,
                objectId: objectId,
                createdAt: new Date(),
                accountId: account._id.toString(),
                accountRole: account.role
              };
          
              return await this.save(activity);
        }
        catch(error) {
            logger.error(error);
        }
    }

    async removeActivitiesOfAccount(accountId: string): Promise<number> {
        const result = await this.getCollection().deleteMany({ accountId: accountId } as FilterQuery<IActivity>);
        return result.deletedCount as number;
    }

}

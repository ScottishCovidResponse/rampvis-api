import {provide} from "inversify-binding-decorators";

import {TYPES} from "./config/types";
import {DataService} from "./data.service";
import {IPage} from "../infrastructure/entities/page.interface";
import {inject} from "inversify";
import {DbClient} from "../infrastructure/db/mongodb.connection";
import config from "config";
import {IUser} from "../infrastructure/entities/user.interface";
import {FilterQuery} from "mongodb";


@provide(TYPES.SearchService)
export class SearchService extends DataService<IPage>{
    public constructor(
        @inject(TYPES.DbClient) dbClient: DbClient,
    ) {
        super(
            dbClient,
            config.get('mongodb.db'),
            config.get('mongodb.collection.pages')
        );
    }

    async search(inputString: string): Promise<IPage[]> {
        return this.getCollection().find({$text: {$search: inputString}}).toArray();
    }
}

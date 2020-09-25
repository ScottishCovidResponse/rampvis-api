import "reflect-metadata";
import config from 'config';
import {inject} from "inversify";
import {provide} from "inversify-binding-decorators";
import {FilterQuery, FindAndModifyWriteOpResultObject, ObjectId} from "mongodb";


import {TYPES} from './config/types';
import {DbClient} from '../infrastructure/db/mongodb.connection';
import {DataService} from './data.service';
import {BookmarkDto} from "../infrastructure/dto/bookmark.dto";
import {IBookmark} from "../infrastructure/entities/bookmark.interface";
import {IUser} from "../infrastructure/entities/user.interface";
import {logger} from "../utils/logger";
import {MAPPING_TYPES} from "./config/automapper.config";

@provide(TYPES.BookmarkService)
export class BookmarkService extends DataService<IBookmark> {
    public constructor(
        @inject(TYPES.DbClient) dbClient: DbClient,
    ) {
        super(
            dbClient,
            config.get('mongodb.db'),
            config.get('mongodb.collection.bookmarks')
        );
    }

    async saveBookmark(user: IUser, bookmarkDto: BookmarkDto): Promise<IBookmark> {
        const bookmark: IBookmark = {
             _id: new ObjectId(),
            userId: <string>user._id,
            pageId: bookmarkDto.pageId,
        };

        logger.debug('BookmarkController: saveBookmark: bookmark = ', bookmark);
        return await this.save(bookmark);
    }

    async getBookmarkInfo(user: IUser, pageId: string): Promise<IBookmark> {
        return await this.get({userId: <string>user._id , pageId: pageId});
    }

    async getAllBookmarks(user: IUser): Promise<IBookmark[]> {
         return await this.getAll({userId: <string>user._id});
    }

    async deleteBookmark(user: IUser, pageId: string): Promise<IBookmark> {
        const res: FindAndModifyWriteOpResultObject<IBookmark> = await this.getDbCollection().findOneAndDelete({userId: <string>user._id , pageId: pageId } as FilterQuery<IBookmark>);
        return automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, res.value);
    }

}

import "reflect-metadata";
import config from 'config';
import { injectable, inject } from "inversify";
import {provide} from "inversify-binding-decorators";
import { ObjectId, FilterQuery } from "mongodb";


import { TYPES } from './config/types';
import { DbClient } from '../infrastructure/db/mongodb.connection';
import { DataService } from './data.service';
import {BookmarkDto} from "../infrastructure/dto/bookmark.dto";
import {IBookmark} from "../infrastructure/entities/bookmark.interface";
import {IUser} from "../infrastructure/entities/user.interface";
import {logger} from "../utils/logger";

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


    async saveBookmark(bookmarkDto: BookmarkDto, user: IUser): Promise<IBookmark> {
        const bookmark: IBookmark = {
             _id: new ObjectId(),
            userId: <string>user._id,

            urlId: bookmarkDto.urlId,
            url: bookmarkDto.url,
            thumbnail: bookmarkDto.thumbnail,
            visFunctionId: bookmarkDto.visFunctionId,
            dataId: bookmarkDto.dataId,
        };

        logger.debug('BookmarkController: saveBookmark: bookmark = ', bookmark);
        return await this.save(bookmark);
    }

    async getAllBookmarks(user: IUser): Promise<IBookmark[]> {
         return await this.getAll({userId: <string>user._id});
    }

    async deleteBookmark(id: string): Promise<IBookmark> {
        return await this.delete(id);
    }

}

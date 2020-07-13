import { ObjectId } from 'bson';

export interface IBookmark {
    _id: string | ObjectId;

    pageId: string;
    userId: string;
    thumbnail?: any
}

import { ObjectId } from 'bson';

export interface IBookmark {
    _id: string | ObjectId;

    pageId: string;
    thumbnail: any

    userId: string;
}

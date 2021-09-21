import { ObjectId } from 'bson';

export interface IThumbnail {
    _id: string | ObjectId;
    pageId: string;
    thumbnail?: any
}

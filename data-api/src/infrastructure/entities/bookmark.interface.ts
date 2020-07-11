import { ObjectId } from 'bson';

export interface IBookmark {
    _id: string | ObjectId;

    urlId: string;
    url: string;
    thumbnail: any
    visFunctionId: string;
    dataId: string;

    userId: string;
}

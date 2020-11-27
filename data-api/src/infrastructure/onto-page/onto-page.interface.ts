import { ObjectId } from 'mongodb';

export enum PUBLISH_TYPE {
    EXAMPLE = 'example',
    REVIEW = 'review',
    RELEASE = 'release',
}

export interface IBinding {
    visId: string;
    dataIds: string[];
}

export class IOntoPage {
    public _id!: string | ObjectId;
    public nrows!: number;
    public publishType!: PUBLISH_TYPE;
    public date!: Date;

    public bindings!: IBinding[];
}

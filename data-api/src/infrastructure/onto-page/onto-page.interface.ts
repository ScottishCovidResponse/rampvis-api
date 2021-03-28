import { ObjectId } from 'mongodb';

export enum BINDING_TYPE {
    EXAMPLE = 'example',
    REVIEW = 'review',
    RELEASE = 'release',
}

export interface IBinding {
    visId: string;
    dataIds: Array<string>;
    pageIds?: Array<string>;
}

export class IOntoPage {
    public _id!: string | ObjectId;
    public bindingType!: BINDING_TYPE;
    public bindings!: Array<IBinding>;
    public date!: Date;
    public nrows?: number;
}

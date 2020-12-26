import { ObjectId } from 'mongodb';

export enum BINDING_TYPE {
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
    public bindingType!: BINDING_TYPE;
    public date!: Date;

    public bindings!: IBinding[];
}

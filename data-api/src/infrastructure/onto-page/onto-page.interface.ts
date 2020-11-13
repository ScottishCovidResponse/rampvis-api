import { ObjectId } from 'mongodb';

export interface IBindData {
    dataId: string;
    queryParam: Array<Map<string, string>>;
}

export interface IBindVis {
    visId: string;
    bindData: IBindData[];
}

export class IOntoPage {
    public _id: string | ObjectId = '';
    public title: string = '';
    public bindVis: IBindVis[] = [];
    public nrow: number = 0;
}

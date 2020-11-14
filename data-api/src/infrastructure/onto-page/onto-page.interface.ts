import { ObjectId } from 'mongodb';
import { IQueryParams } from '../onto-data/onto-data.interface';

export interface IBindData {
    dataId: string;
    queryParams: IQueryParams[];
}

export interface IBindVis {
    visId: string;
    bindData: IBindData[];
}

export class IOntoPage {
    public _id: string | ObjectId = '';
    public title: string = '';
    public bindVis: IBindVis[] = [];
    public nrows: number = 0;
}

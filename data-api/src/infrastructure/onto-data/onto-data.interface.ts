import { ObjectId } from 'bson';
import { DATA_TYPE } from './onto-data-types';

export interface IOntoData {
    _id: string | ObjectId;
    urlCode: string;
    endpoint: string;
    dataType: DATA_TYPE;
    date: Date;
    description: string;
    keywords: string;
}

export interface IOntoDataSearch extends IOntoData {
    _id: string;
    score: number;
    pageIds: string[];

}

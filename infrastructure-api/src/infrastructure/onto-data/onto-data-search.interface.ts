import { IOntoData } from './onto-data.interface';

export interface IOntoDataSearch extends IOntoData {
    _id: string;
    score: number;
    pageIds?: Array<string>;
}

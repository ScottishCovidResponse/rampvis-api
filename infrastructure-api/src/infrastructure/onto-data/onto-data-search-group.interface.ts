import { IOntoData } from './onto-data.interface';

export interface IOntoDataSearchGroup {
    score?: number;
    groups: IOntoData[];
}

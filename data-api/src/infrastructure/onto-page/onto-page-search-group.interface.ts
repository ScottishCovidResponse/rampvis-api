import { IOntoPage } from './onto-page.interface';

export interface IOntoPageSearchGroup {
    score?: number;
    groups: IOntoPage[];
}

import { VIS_TYPE } from '../onto-vis/onto-vis-type.enum';
import { IOntoPage } from './onto-page.interface';

export interface IOntoPageSearch extends IOntoPage {
    score: number;
    dataDescription: string;
    visDescription: string;
    visType: VIS_TYPE;
    keywords: string;
}

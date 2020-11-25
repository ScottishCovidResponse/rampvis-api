import { ObjectId } from 'bson';
import { DATA_TYPE } from '../onto-data/onto-data-types';
import { VIS_TYPE } from './onto-vis-type.enum';

export interface IOntoVis {
    _id: string | ObjectId;
    function: string;
    type: VIS_TYPE;
    description: string;
    dataTypes: DATA_TYPE[];
}

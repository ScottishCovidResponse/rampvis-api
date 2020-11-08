import { ObjectId } from 'bson';
import { VIS_TYPE } from './onto-vis-type.enum';

export interface IOntoVis {
    _id: string | ObjectId;
    function: string;
    type: VIS_TYPE;
    description: string;
}

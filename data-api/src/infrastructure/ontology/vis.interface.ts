import { ObjectId } from 'bson';
import { VIS_TYPE } from './vis-type.enum';

export interface IVis {
    _id: string | ObjectId;
    function: string;
    type: VIS_TYPE;
    description: string;
}

import { DATA_TYPE } from '../onto-data/onto-data-types';
import { VIS_TYPE } from './onto-vis-type.enum';

export class OntoVisDto {
    public id: string = undefined as any;
    public function: string = undefined as any;
    public type: VIS_TYPE = undefined as any;
    public description: string = undefined as any;
    public dataTypes: DATA_TYPE[] = undefined as any;
}

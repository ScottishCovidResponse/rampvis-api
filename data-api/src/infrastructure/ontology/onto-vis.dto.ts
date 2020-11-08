import { VIS_TYPE } from './onto-vis-type.enum';

export class OntoVisDto {
    public id: string = '';
    public function: string = '';
    public type: VIS_TYPE = undefined as any;
    public description: string = '';
}

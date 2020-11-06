import { VIS_TYPE } from './vis-type.enum';

export class VisDto {
    public id: string = '';
    public function: string = '';
    public type: VIS_TYPE = undefined as any;
    public description: string = '';
}

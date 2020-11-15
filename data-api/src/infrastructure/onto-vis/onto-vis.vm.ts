import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { VIS_TYPE } from './onto-vis-type.enum';

export class OntoVisVm {
    @IsOptional()
    @IsString()
    public id!: string;
    @IsString()
    public function!: string;
    @IsEnum(VIS_TYPE)
    public type!: VIS_TYPE;
    @IsString()
    public description!: string;
}

import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { VIS_TYPE } from './vis-type.enum';

export class VisVm {
    @IsString()
    public function!: string;
    @IsEnum(VIS_TYPE)
    public type!: VIS_TYPE;
    @IsString()
    public description!: string;
}

import { IsArray, IsEnum, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { DATA_TYPE } from '../onto-data/onto-data-types';
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

    @IsArray()
    @IsEnum(DATA_TYPE, { each: true })
    public dataTypes!: DATA_TYPE[];
}

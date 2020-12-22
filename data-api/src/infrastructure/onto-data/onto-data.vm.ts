import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { DATA_TYPE } from './onto-data-types';

export class OntoDataVm {
    @IsOptional()
    @IsString()
    public id!: string;

    @IsString()
    public urlCode!: string;

    @IsString()
    public endpoint!: string;

    @IsEnum(DATA_TYPE)
    public dataType!: DATA_TYPE;

    @IsArray()
    public keywords!: string[];

    @IsString()
    public description!: string;
}

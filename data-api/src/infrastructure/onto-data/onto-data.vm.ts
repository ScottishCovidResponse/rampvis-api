import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ANALYTICS, DATA_TYPE, MODEL, SOURCE } from './onto-data-types';

export class QueryParamsVm {
    @IsString()
    public query!: string;

    @IsArray()
    public params!: string[];
}
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

    @IsString()
    public productDesc!: string;

    @IsString()
    public streamDesc!: string;

    @IsOptional()
    @IsEnum(SOURCE)
    public source!: SOURCE;

    @IsOptional()
    @IsEnum(MODEL)
    public model!: MODEL;

    @IsOptional()
    @IsEnum(ANALYTICS)
    public analytics!: ANALYTICS;

    @IsOptional()
    @IsArray()
    @Type(() => QueryParamsVm)
    @ValidateNested({ each: true })
    public queryParams!: QueryParamsVm[];
}

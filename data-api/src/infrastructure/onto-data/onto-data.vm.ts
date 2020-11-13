import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, Validate, ValidateNested } from 'class-validator';
import { ANALYTICS, MODEL, SOURCE } from './onto-data-types';

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
    public url!: string;
    @IsString()
    public endpoint!: string;
    @IsString()
    public description!: string;

    @IsArray()
    @Type(() => QueryParamsVm)
    @ValidateNested({ each: true })
    public queryParams!: QueryParamsVm[];

    @IsOptional()
    @IsEnum(SOURCE)
    public source!: SOURCE;

    @IsOptional()
    @IsEnum(MODEL)
    public model!: MODEL;

    @IsOptional()
    @IsEnum(ANALYTICS)
    public analytics!: ANALYTICS;
}

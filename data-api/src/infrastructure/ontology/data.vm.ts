import { IsArray, IsEnum, IsObject, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ANALYTICS, MODEL, SOURCE } from './data-types';

export class QueryParamsVm {
    @IsString()
    public query!: string;
    @IsArray()
    public params!: string[];
}

export class DataVm {
    @IsOptional()
    @IsString()
    public id!: string;
    @IsString()
    public url!: string;
    @IsString()
    public endpoint!: string;
    @IsString()
    public description!: string;

    @IsOptional()
    @Type(() => QueryParamsVm)
    @ValidateNested({ each: true })
    public query_params!: QueryParamsVm[];

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

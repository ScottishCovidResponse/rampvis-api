import { IsArray, IsEnum, IsObject, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ANALYTICS, MODEL, SOURCE } from './onto-data-types';
import { QueryParamsVm } from './query-params.vm';

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

    @IsOptional()
    @IsArray()
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

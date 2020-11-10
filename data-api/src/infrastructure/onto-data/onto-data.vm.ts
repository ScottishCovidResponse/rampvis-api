import { IsArray, IsEnum, IsObject, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ANALYTICS, MODEL, SOURCE } from './onto-data-types';

export class QueryParamsVm1 {
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

    @IsOptional()
    @IsArray()
    @Type(() => QueryParamsVm1)
    @ValidateNested({ each: true })
    public queryParams!: QueryParamsVm1[];

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

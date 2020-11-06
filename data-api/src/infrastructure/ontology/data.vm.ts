import { IsArray, IsEnum, IsObject, IsOptional, IsString, IsUrl } from 'class-validator';
import { ANALYTICS, MODEL, SOURCE } from './data-types';

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
    @IsObject()
    public query_params!: {[key: string]: Array<string>};
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

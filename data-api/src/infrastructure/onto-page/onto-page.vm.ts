import { IsArray, IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryParamsVm2 {
    @IsString()
    public query!: string;

    @IsString()
    public params!: string;
}

export class BindDataVm {
    @IsString()
    dataId!: string;

    @IsOptional()
    @IsArray()
    @Type(() => QueryParamsVm2)
    @ValidateNested({ each: true })
    queryParams!: QueryParamsVm2[];
}

export class BindVisVm {
    @IsString()
    visId!: string;

    @IsArray()
    @Type(() => BindDataVm)
    @ValidateNested({ each: true })
    bindData!: BindDataVm[];
}

export class OntoPageVm {
    @IsOptional()
    @IsString()
    public id!: string;

    @IsOptional()
    @IsString()
    public title!: string;

    @IsNumber()
    public nrow!: number;

    @IsArray()
    @Type(() => BindVisVm)
    @ValidateNested({ each: true })
    bindVis!: BindVisVm[];

    // @IsArray()
    // @IsOptional()
    // links
}

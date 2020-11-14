import {
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryParamVm {
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
    @Type(() => QueryParamVm)
    @ValidateNested({ each: true })
    queryParams!: QueryParamVm[];
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
    public nrows!: number;

    @IsArray()
    @Type(() => BindVisVm)
    @ValidateNested({ each: true })
    bindVis!: BindVisVm[];

    // @IsArray()
    // @IsOptional()
    // links
}

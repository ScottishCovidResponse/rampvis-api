import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PUBLISH_TYPE } from './onto-page.interface';

export class BindingVm {
    @IsString()
    visId!: string;

    @IsString({ each: true })
    dataIds!: string[];
}

export class OntoPageVm {
    @IsOptional()
    @IsString()
    public id!: string;

    @IsNumber()
    public nrows!: number;

    @IsEnum(PUBLISH_TYPE)
    public publishType!: PUBLISH_TYPE;

    @IsArray()
    @Type(() => BindingVm)
    @ValidateNested({ each: true })
    bindings!: BindingVm[];
}

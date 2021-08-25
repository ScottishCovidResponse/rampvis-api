import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PAGE_TYPE } from './onto-page.interface';

export class BindingVm {

}

export class OntoPageVm {
    @IsOptional()
    @IsString()
    public id!: string;

    @IsEnum(PAGE_TYPE)
    public pageType!: PAGE_TYPE;

    @IsString()
    visId!: string;

    @IsString({ each: true })
    dataIds!: string[];

    @IsOptional()
    @IsString({ each: true })
    pageIds!: string[];
}

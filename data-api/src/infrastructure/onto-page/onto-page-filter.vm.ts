import { IsOptional, IsEnum, IsString } from 'class-validator';
import { BINDING_TYPE } from './onto-page.interface';

export enum ONTOPAGE_SORT_BY {
    BINDING_TYPE = 'bindingType',
    DATE = 'date',
}

export enum SORT_ORDER {
    ASC = 'asc',
    DESC = 'desc',
}

export class OntoPageFilterVm {
    @IsEnum(BINDING_TYPE)
    bindingType!: BINDING_TYPE;

    @IsOptional()
    @IsString()
    pageIndex!: string;

    @IsOptional()
    @IsString()
    pageSize!: string;

    @IsOptional()
    @IsEnum(ONTOPAGE_SORT_BY)
    sortBy!: ONTOPAGE_SORT_BY;

    @IsOptional()
    @IsEnum(SORT_ORDER)
    sortOrder!: SORT_ORDER;

    @IsOptional()
    @IsString()
    filter!: string;
}

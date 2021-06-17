import { IsOptional, IsEnum, IsString } from 'class-validator';
import { SORT_ORDER } from '../sort-order.enum';
import { BINDING_TYPE } from './onto-page.interface';

export enum ONTOPAGE_SORT_BY {
    BINDING_TYPE = 'bindingType',
    DATE = 'date',
    FUNCTION = 'function'
}

export class OntoPageFilterVm {
    @IsOptional()
    @IsEnum(BINDING_TYPE)
    filterPageType!: BINDING_TYPE;

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
    filterId!: string;
}

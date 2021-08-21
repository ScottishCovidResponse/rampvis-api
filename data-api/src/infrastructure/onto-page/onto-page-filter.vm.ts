import { IsOptional, IsEnum, IsString } from 'class-validator';
import { VIS_TYPE } from '../onto-vis/onto-vis-type.enum';
import { SORT_ORDER } from '../sort-order.enum';
import { BINDING_TYPE } from './onto-page.interface';

export enum ONTOPAGE_SORT_BY {
    BINDING_TYPE = 'bindingType',
    VIS_TYPE = 'visType',
    DATE = 'date',
    FUNCTION = 'function'
}

export class OntoPageFilterVm {
    @IsOptional()
    @IsEnum(VIS_TYPE)
    filterVisType!: VIS_TYPE;

    @IsOptional()
    @IsEnum(BINDING_TYPE)
    filterBindingType!: BINDING_TYPE;

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

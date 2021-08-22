import { IsOptional, IsEnum, IsString } from 'class-validator';
import { VIS_TYPE } from '../onto-vis/onto-vis-type.enum';
import { SORT_ORDER } from '../sort-order.enum';
import { PAGE_TYPE } from './onto-page.interface';

export enum ONTOPAGE_SORT_BY {
    PAGE_TYPE = 'pageType',
    VIS_TYPE = 'visType',
    DATE = 'date',
    FUNCTION = 'function'
}

export class OntoPageFilterVm {
    @IsOptional()
    @IsEnum(VIS_TYPE)
    filterVisType!: VIS_TYPE;

    @IsOptional()
    @IsEnum(PAGE_TYPE)
    filterPageType!: PAGE_TYPE;

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

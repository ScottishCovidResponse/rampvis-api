import { IsOptional, IsEnum, IsString } from 'class-validator';
import { SORT_ORDER } from '../sort-order.enum';

export enum ONTOPAGE_SORT_BY {
    PAGE_TYPE = 'pageType',
    VIS_TYPE = 'visType',
    DATE = 'date',
    FUNCTION = 'function'
}

export class OntoPageFilterVm {
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

import { IsOptional, IsEnum, IsString } from 'class-validator';
import { SORT_ORDER } from '../sort-order.enum';
import { SORT_BY } from './onto-data-filter.vm';
import { DATA_TYPE } from './onto-data-types';

 export class OntoDataSearchFilterVm {
    @IsString()
    query!: string;

    @IsOptional()
    @IsString()
    visId!: string;

    @IsOptional()
    @IsEnum(DATA_TYPE)
    dataType!: DATA_TYPE;

    // Not used as we are doing in browser pagination
    @IsOptional()
    @IsString()
    pageIndex!: string;

    @IsOptional()
    @IsString()
    pageSize!: string;

    @IsOptional()
    @IsEnum(SORT_BY)
    sortBy!: SORT_BY;

    @IsOptional()
    @IsEnum(SORT_ORDER)
    sortOrder!: SORT_ORDER;

    @IsOptional()
    @IsString()
    filter!: string;
}

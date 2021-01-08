import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ONTODATA_SORT_BY, SORT_ORDER } from './onto-data-filter.vm';
import { DATA_TYPE } from './onto-data-types';

 export class OntoDataSearchFilterVm {
    @IsOptional()
    @IsEnum(DATA_TYPE)
    dataType!: DATA_TYPE;

    @IsOptional()
    @IsString()
    pageIndex!: string;

    @IsOptional()
    @IsString()
    pageSize!: string;

    @IsOptional()
    @IsEnum(ONTODATA_SORT_BY)
    sortBy!: ONTODATA_SORT_BY;

    @IsOptional()
    @IsEnum(SORT_ORDER)
    sortOrder!: SORT_ORDER;

    @IsOptional()
    @IsString()
    filter!: string;

    @IsString()
    query!: string;

    @IsOptional()
    @IsString()
    visId!: string;
}

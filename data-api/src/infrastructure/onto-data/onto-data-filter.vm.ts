import { IsOptional, IsEnum, IsString } from 'class-validator';
import { SORT_ORDER } from '../sort-order.enum';
import { DATA_TYPE } from './onto-data-types';

export enum SORT_BY {
    DATA_TYPE = 'dataType',
    DESCRIPTION = 'description',
    DATE = 'date',
    SCORE = 'score',
}

export class OntoDataFilterVm {
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
    @IsEnum(SORT_BY)
    sortBy!: SORT_BY;

    @IsOptional()
    @IsEnum(SORT_ORDER)
    sortOrder!: SORT_ORDER;

    @IsOptional()
    @IsString()
    filter!: string;
}

import { IsOptional, IsEnum, IsString } from 'class-validator';
import { DATA_TYPE } from './onto-data-types';

export enum ONTODATA_SORT_BY {
    DATA_TYPE = 'dataType',
    DESC = 'description',
    DATE = 'date',
}

export enum SORT_ORDER {
    ASC = 'asc',
    DESC = 'desc',
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
    @IsEnum(ONTODATA_SORT_BY)
    sortBy!: ONTODATA_SORT_BY;

    @IsOptional()
    @IsEnum(SORT_ORDER)
    sortOrder!: SORT_ORDER;

    @IsOptional()
    @IsString()
    filter!: string;
}

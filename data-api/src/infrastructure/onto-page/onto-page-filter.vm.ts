import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PUBLISH_TYPE } from './onto-page.interface';

export enum SORT_BY_FILTER_ONTOPAGE {
    TITLE = 'title',
    PUBLISH_TYPE = 'publishType',
    DATE = 'date',
}

export enum SORT_ORDER_FILTER {
    ASC = 'asc',
    DESC = 'desc',
}

export class OntoPageFilterVm {
    @IsEnum(PUBLISH_TYPE)
    publishType!: PUBLISH_TYPE;

    @IsOptional()
    @IsString()
    page!: string;

    @IsOptional()
    @IsString()
    pageCount!: string;

    @IsOptional()
    @IsEnum(SORT_BY_FILTER_ONTOPAGE)
    sortBy!: SORT_BY_FILTER_ONTOPAGE;

    @IsOptional()
    @IsEnum(SORT_ORDER_FILTER)
    sortOrder!: SORT_ORDER_FILTER;

    @IsOptional()
    @IsString()
    filter!: string;
}

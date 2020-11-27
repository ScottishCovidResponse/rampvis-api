import { IsOptional, IsEnum, IsString } from 'class-validator';

export enum ONTODATA_SORT_BY {
    TITLE = 'title',
    PUBLISH_TYPE = 'publishType',
    DATE = 'date',
}

export enum SORT_ORDER {
    ASC = 'asc',
    DESC = 'desc',
}

export class OntoDataFilterVm {
    // @IsEnum(PUBLISH_TYPE)
    // publishType!: PUBLISH_TYPE;


    @IsOptional()
    @IsString()
    page!: string;

    @IsOptional()
    @IsString()
    pageCount!: string;

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

import { IsOptional, IsEnum, IsString } from 'class-validator';
import { SORT_ORDER } from '../sort-order.enum';

export enum SORT_BY {
    SCORE = 'score',
}

export class OntoDataSearchGroupFilterVm {
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

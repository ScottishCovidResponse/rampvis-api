import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ActivityFilterVm {
    @IsOptional()
    @IsString()
    page!: string;

    @IsOptional()
    @IsString()
    pageCount!: string;

    @IsOptional()
    @IsString()
    filter!: string;

    @IsOptional()
    @IsDateString()
    startDt!: Date;

    @IsOptional()
    @IsDateString()
    endDt!: Date;
}

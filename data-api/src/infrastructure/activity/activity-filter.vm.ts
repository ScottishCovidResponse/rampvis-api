import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ActivityFilterVm {

    @IsOptional()
    @IsString()
    public page!: string;

    @IsOptional()
    @IsString()
    public pageCount!: string;

    @IsOptional()
    @IsString()
    public filter!: string;

    @IsOptional()
    @IsDateString()
    public startDt!: Date;

    @IsOptional()
    @IsDateString()
    public endDt!: Date;
}

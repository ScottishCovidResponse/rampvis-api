import { IsOptional, IsString } from 'class-validator';

export class ThumbnailDto {
    @IsString()
    id!: string;

    @IsOptional()
    thumbnail!: any;
}

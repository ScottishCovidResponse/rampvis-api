import { IsOptional, IsString} from "class-validator";

export class ThumbnailDto {
    @IsString()
    pageId!: string;

    @IsOptional()
    thumbnail!: any
}

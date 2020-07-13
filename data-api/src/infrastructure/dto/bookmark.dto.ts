import { IsOptional, IsString} from "class-validator";

export class BookmarkDto {
    @IsString()
    pageId!: string;

    @IsOptional()
    thumbnail!: any

    @IsOptional()
    userId: string;
}

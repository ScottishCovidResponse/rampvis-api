import {IsNotEmpty, IsString} from "class-validator";

export class BookmarkDto {
    @IsString()
    pageId!: string;

    @IsString()
    url!: string;

    @IsNotEmpty()
    thumbnail!: any
}

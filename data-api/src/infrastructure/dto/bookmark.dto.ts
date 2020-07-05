import {IsNotEmpty, IsString} from "class-validator";

export class BookmarkDto {
    @IsString()
    urlId!: string;

    @IsString()
    url!: string;

    @IsNotEmpty()
    thumbnail!: any

    @IsString()
    visFunctionId!: string;

    @IsString()
    dataId!: string;
}

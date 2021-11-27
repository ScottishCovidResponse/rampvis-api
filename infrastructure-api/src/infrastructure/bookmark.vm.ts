import { IsBoolean, IsString } from 'class-validator';

export class BookmarkVm {
    @IsString()
    pageId!: string;

    @IsBoolean()
    status!: boolean;
}

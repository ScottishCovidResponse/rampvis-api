import { IsEnum } from 'class-validator';
import { PAGE_TYPE } from './onto-page.interface';

export class UpdateOntoPageTypeVm {
    @IsEnum(PAGE_TYPE)
    public pageType!: PAGE_TYPE;
}

import { IsEnum } from 'class-validator';
import { BINDING_TYPE } from './onto-page.interface';

export class UpdateOntoPageBindingTypeVm {
    @IsEnum(BINDING_TYPE)
    public bindingType!: BINDING_TYPE;
}

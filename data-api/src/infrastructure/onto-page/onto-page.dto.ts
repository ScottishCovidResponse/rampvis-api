import { BindingDto, BindingExtDto } from './binding.dto';
import { BINDING_TYPE } from './onto-page.interface';

export class OntoPageDto {
    public id: string = undefined as any;
    public nrows: number = undefined as any;
    public date: Date = undefined as any;
    public bindingType: BINDING_TYPE = undefined as any;
    public bindings: BindingDto[] = undefined as any;
}

export class OntoPageExtDto extends OntoPageDto {
    public bindingExts: BindingExtDto[] = undefined as any;
}

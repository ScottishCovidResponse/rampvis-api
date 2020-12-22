import { BINDING_TYPE } from './onto-page.interface';

export class BindingDto {
    public visId: string = undefined as any;
    public dataIds: string[] = undefined as any;
}

export class OntoPageDto {
    public id: string = undefined as any;
    public nrows: number = undefined as any;
    public date: Date = undefined as any;
    public bindingType: BINDING_TYPE = undefined as any;
    public bindings: BindingDto[] = undefined as any;
}

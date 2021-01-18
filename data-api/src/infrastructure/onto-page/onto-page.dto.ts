import { OntoDataDto } from '../onto-data/onto-data.dto';
import { OntoVisDto } from '../onto-vis/onto-vis.dto';
import { BINDING_TYPE } from './onto-page.interface';

export class BindingDto {
    public visId: string = undefined as any;
    public dataIds: string[] = undefined as any;
}

export class BindingExtDto {
    public vis: OntoVisDto = undefined as any;
    public data: OntoDataDto[] = undefined as any;
}

export class OntoPageDto {
    public id: string = undefined as any;
    public nrows: number = undefined as any;
    public date: Date = undefined as any;
    public bindingType: BINDING_TYPE = undefined as any;
    public bindings: BindingDto[] = undefined as any;
}

export class OntoPageExtDto {
    public id: string = undefined as any;
    public nrows: number = undefined as any;
    public date: Date = undefined as any;
    public bindingType: BINDING_TYPE = undefined as any;
    public bindingExts: BindingExtDto[] = undefined as any;
}

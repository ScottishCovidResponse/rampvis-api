import { OntoDataDto } from '../onto-data/onto-data.dto';
import { OntoVisDto } from '../onto-vis/onto-vis.dto';
import { OntoPageExtDto } from './onto-page.dto';

export class BindingDto {
    public visId: string = undefined as any;
    public dataIds: string[] = undefined as any;
    public pageIds: string[] = undefined as any;
}

export class BindingExtDto {
    public vis: OntoVisDto = undefined as any;
    public data: OntoDataDto[] = undefined as any;
    public links: OntoPageExtDto[] = undefined as any; // TODO review this
}

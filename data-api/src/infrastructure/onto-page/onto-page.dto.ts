import { OntoDataDto } from '../onto-data/onto-data.dto';
import { OntoVisDto } from '../onto-vis/onto-vis.dto';
import { PAGE_TYPE } from './onto-page.interface';
import { VIS_TYPE } from '../onto-vis/onto-vis-type.enum';

export class OntoPageDto {
    public id: string = undefined as any;
    public pageType: PAGE_TYPE = undefined as any;
    public date: Date = undefined as any;
    public visId: string = undefined as any;
    public dataIds: string[] = undefined as any;
    public pageIds?: string[] = undefined as any;
}

export class OntoPageExtDto extends OntoPageDto {
    public vis: OntoVisDto = undefined as any;
    public data: OntoDataDto[] = undefined as any;
}

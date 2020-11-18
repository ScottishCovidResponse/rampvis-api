import { QueryParamsDto } from '../onto-data/onto-data.dto';
import { PUBLISH_TYPE } from './onto-page.interface';

export class BindDataDto {
    public dataId: string = '';
    public queryParams: QueryParamsDto[] = [];
}

export class BindVisDto {
    public visId: string = '';
    public bindData: BindDataDto[] = [];
}

export class OntoPageDto {
    public id: string = '';
    public title: string = '';
    public bindVis: BindVisDto[] = [];
    public nrow: number = 0;
    public publishType: PUBLISH_TYPE = undefined as any;
}

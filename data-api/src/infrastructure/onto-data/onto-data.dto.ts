import { ANALYTICS, MODEL, SOURCE } from './onto-data-types';
import { QueryParamsDto } from './query-params.dto';

export class OntoDataDto {
    public id: string = '';
    public url: string = '';
    public endpoint: string = '';
    public query_params?: QueryParamsDto[] = [];
    public description: string = '';
    public source?: SOURCE = '' as any;
    public model?: MODEL = '' as any;
    public analytics?: ANALYTICS = '' as any;
}

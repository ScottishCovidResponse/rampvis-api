import { ANALYTICS, MODEL, SOURCE } from './data-types';

export class QueryParamsDto {
    query: string = '';
    params: string[] = [];
}

export class DataDto {
    public id: string = '';
    public url: string = '';
    public endpoint: string = '';
    public query_params?: QueryParamsDto[] = [];
    public description: string = '';
    public source?: SOURCE = '' as any;
    public model?: MODEL = '' as any;
    public analytics?: ANALYTICS = '' as any;
}

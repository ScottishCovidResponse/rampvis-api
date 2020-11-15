import { ANALYTICS, MODEL, SOURCE } from './onto-data-types';

export class QueryParamsDto {
    query: string = '';
    params: string[] | string = undefined as any;
}

export class OntoDataDto {
    public id: string = '';
    public url: string = '';
    public endpoint: string = '';
    public queryParams?:  QueryParamsDto[] = [];
    public description: string = '';
    public source?: SOURCE = '' as any;
    public model?: MODEL = '' as any;
    public analytics?: ANALYTICS = '' as any;
}

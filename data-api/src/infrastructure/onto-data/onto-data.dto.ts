import { ANALYTICS, DATA_TYPE, MODEL, SOURCE } from './onto-data-types';

export class QueryParamsDto {
    query: string = '';
    params: string[] | string = undefined as any;
}

export class OntoDataDto {
    public id: string = undefined as any;
    public urlCode: string = undefined as any;
    public endpoint: string = undefined as any;
    public dataType: DATA_TYPE = undefined as any;
    public source?: SOURCE;
    public model?: MODEL;
    public analytics?: ANALYTICS;
    public description: string = undefined as any;
    public queryParams?:  QueryParamsDto[];
}

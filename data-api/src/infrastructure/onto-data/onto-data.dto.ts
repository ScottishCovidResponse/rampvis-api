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
    public source?: SOURCE = undefined as any;
    public model?: MODEL = undefined as any;
    public analytics?: ANALYTICS = undefined as any;
    public description: string = undefined as any;
    public queryParams?: QueryParamsDto[] = undefined as any;
}

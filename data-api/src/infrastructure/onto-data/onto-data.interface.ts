import { ObjectId } from 'bson';
import { ANALYTICS, DATA_TYPE, MODEL, SOURCE } from './onto-data-types';

export interface IQueryParams {
    query: string;
    params: string[] | string;
}

export interface IOntoData {
    _id: string | ObjectId;
    urlCode: string;
    endpoint: string;
    dataType: DATA_TYPE;
    source?: SOURCE;
    model?: MODEL;
    analytics?: ANALYTICS;
    description: string;

    queryParams?: IQueryParams[];
}

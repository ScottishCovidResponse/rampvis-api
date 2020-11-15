import { ObjectId } from 'bson';
import { ANALYTICS, MODEL, SOURCE } from './onto-data-types';

export interface IQueryParams {
    query: string;
    params: string[] | string;
}

export interface IOntoData {
    _id: string | ObjectId;
    url: string;
    endpoint: string;
    queryParams?: IQueryParams[];
    description: string;
    source?: SOURCE;
    model?: MODEL;
    analytics?: ANALYTICS;
}

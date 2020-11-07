import { ObjectId } from 'bson';
import { ANALYTICS, MODEL, SOURCE } from './data-types';

export interface IQueryParams {
    query: string;
    params: string[];
}

export interface IData {
    _id: string | ObjectId;
    url: string;
    endpoint: string;
    query_params?: IQueryParams[];
    description: string;
    source?: SOURCE;
    model?: MODEL;
    analytics?: ANALYTICS;
}

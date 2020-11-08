import { ObjectId } from 'bson';
import { ANALYTICS, MODEL, SOURCE } from './onto-data-types';
import { IQueryParams } from './query-params.interface';

export interface IOntoData {
    _id: string | ObjectId;
    url: string;
    endpoint: string;
    query_params?: IQueryParams[];
    description: string;
    source?: SOURCE;
    model?: MODEL;
    analytics?: ANALYTICS;
}

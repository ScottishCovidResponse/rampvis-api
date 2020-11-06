import { ObjectId } from 'bson';
import { ANALYTICS, MODEL, SOURCE } from './data-types';

export interface IData {
    _id: string | ObjectId;
    url: string;
    endpoint: string;
    query_params?: {[key: string]: Array<string>};
    description: string;
    source?: SOURCE;
    model?: MODEL;
    analytics?: ANALYTICS;
}

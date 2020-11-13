import { ObjectId } from 'bson';
import { ANALYTICS, MODEL, SOURCE } from './onto-data-types';

export interface IOntoData {
    _id: string | ObjectId;
    url: string;
    endpoint: string;
    queryParams?:  Array<Map<string, string[]>>;
    description: string;
    source?: SOURCE;
    model?: MODEL;
    analytics?: ANALYTICS;
}

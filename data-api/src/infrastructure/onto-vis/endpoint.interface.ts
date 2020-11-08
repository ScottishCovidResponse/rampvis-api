import { IQueryParams } from "../onto-data/query-params.interface";

export interface IEndpoint {
    dataId: string;
    query_params: IQueryParams[];
}
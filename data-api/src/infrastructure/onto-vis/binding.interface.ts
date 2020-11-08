import { IEndpoint } from "./endpoint.interface";

export interface IBinding {
    visId: string;
    endpoints: IEndpoint[];
}
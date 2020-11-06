import { ANALYTICS, MODEL, SOURCE } from "./data-types";

export class DataDto {
    public id: string = '';
    public url: string = '';
    public endpoint: string = '';
    public query_params?: {[key: string]: Array<string>} = undefined as any;
    public description: string = '';
    public source?: SOURCE = undefined as any;
    public model?: MODEL = undefined as any;
    public analytics?: ANALYTICS = undefined as any;
}
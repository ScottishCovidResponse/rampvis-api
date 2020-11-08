import { IsArray, IsString } from 'class-validator';

export class QueryParamsVm {
    @IsString()
    public query!: string;
    @IsArray()
    public params!: string[] | string;
}

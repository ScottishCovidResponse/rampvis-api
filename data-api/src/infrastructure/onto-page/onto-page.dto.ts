import { IBinding } from "../onto-vis/binding.interface";
import { IQueryParams } from "../onto-data/query-params.interface";

export class OntoPageDto {
    public id: string = '';
    public title: string = '';
    public binding: IBinding[] = [];
    public nrows: number = 0;
}
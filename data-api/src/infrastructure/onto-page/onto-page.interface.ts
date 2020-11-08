import { IBinding } from "../onto-vis/binding.interface";
import { IQueryParams } from "../onto-data/query-params.interface";

export class IOntoPage {
    public id: string = '';
    public title: string = '';
    public bindings: IBinding[] = [];
    public nrows: number = 0;
}
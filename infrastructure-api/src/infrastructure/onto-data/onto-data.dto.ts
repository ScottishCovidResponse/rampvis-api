import { DATA_TYPE } from './onto-data-types';
import { ILink } from '../onto-page/link.interface';

export class OntoDataDto {
    public id: string = undefined as any;
    public urlCode: string = undefined as any;
    public endpoint: string = undefined as any;
    public dataType: DATA_TYPE = undefined as any;
    public date: Date = undefined as any;
    public description: string = undefined as any;
    public keywords: string[] = undefined as any;
    public links?: ILink[] = undefined as any;
}

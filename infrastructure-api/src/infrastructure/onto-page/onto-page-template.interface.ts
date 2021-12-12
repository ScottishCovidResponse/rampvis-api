import { OntoDataDto } from '../onto-data/onto-data.dto';
import { OntoVisDto } from '../onto-vis/onto-vis.dto';
import { ILink } from './link.interface';
import { OntoPageDto } from './onto-page.dto';

export class IOntoPageTemplate extends OntoPageDto {
    public ontoData: OntoDataDto[] = undefined as any;
    public ontoVis: OntoVisDto = undefined as any;
    public title: string = undefined as any;
    public links?: ILink[] = undefined as any;
}

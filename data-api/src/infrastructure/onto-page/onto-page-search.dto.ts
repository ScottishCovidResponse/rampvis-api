import { VIS_TYPE } from '../onto-vis/onto-vis-type.enum';
import { OntoPageDto } from './onto-page.dto';

export class OntoPageSearchDto extends OntoPageDto {
    score: number = undefined as any;
    dataDescription: string = undefined as any;
    visDescription: string = undefined as any;
    visType: VIS_TYPE = undefined as any;
    keywords: string = undefined as any;
}

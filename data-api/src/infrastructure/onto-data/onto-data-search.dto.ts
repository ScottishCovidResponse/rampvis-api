import { OntoDataDto } from './onto-data.dto';

export class OntoDataSearchDto extends OntoDataDto {
    public score: number = undefined as any;
    public pageIds: string[] = undefined as any;
}

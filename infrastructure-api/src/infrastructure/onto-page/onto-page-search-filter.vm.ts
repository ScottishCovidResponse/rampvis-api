import { IsString } from 'class-validator';

export class OntoPageSearchFilterVm {
    @IsString()
    query!: string;
}

import { IsOptional, IsEnum, IsString } from 'class-validator';

 export class OntoVisSearchFilterVm {
    @IsString()
    query!: string;
}

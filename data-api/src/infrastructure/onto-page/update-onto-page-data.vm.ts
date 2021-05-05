import { IsString } from 'class-validator';

export class UpdateOntoPageDataVm {
  @IsString({ each: true })
  dataIds!: string[];
}

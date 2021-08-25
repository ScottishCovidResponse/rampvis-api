import { IsString } from 'class-validator';

export class UpdateOntoPageDataIdsVm {
  @IsString({ each: true })
  dataIds!: string[];
}

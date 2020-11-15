import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ROLES } from './roles.enum';
 
export class UpdateUserVm {
  @IsOptional()
  @IsString()
  public password?: string;

  @IsOptional()
  @IsEnum(ROLES)
  public role!: ROLES;
}

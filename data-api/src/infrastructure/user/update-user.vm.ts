import { Type } from 'class-transformer';
import { IsOptional, IsString, IsEnum, IsDate } from 'class-validator';
import { ROLES } from './roles.enum';

export class UpdateUserVm {
  @IsOptional()
  @IsString()
  public password?: string;

  @IsOptional()
  @IsEnum(ROLES)
  public role!: ROLES;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public expireOn!: Date;
}

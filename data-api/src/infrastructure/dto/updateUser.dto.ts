import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ACCOUNT_ROLES } from '../entities/user.interface';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  public password?: string;

  @IsOptional()
  @IsString()
  public phone!: string;

  @IsOptional()
  @IsEnum(ACCOUNT_ROLES)
  public role!: ACCOUNT_ROLES;
}

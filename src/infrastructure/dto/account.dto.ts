import { IsNotEmpty, IsOptional, IsString, IsEmail, ValidateNested, IsDate, IsEnum } from 'class-validator';
import { AddressDto } from './address.dto';
import { Type } from 'class-transformer';
import { ACCOUNT_ROLES } from '../entities/account.interface';

export class AccountDto {

  @IsOptional()
  @IsString()
  public id!: string;

  @IsString()
  public name!: string;

  @IsEmail()
  public email!: string;

  @IsOptional()
  @IsString()
  public password?: string;

  @IsString()
  public phone!: string;

  @IsEnum(ACCOUNT_ROLES)
  public role!: ACCOUNT_ROLES;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public createdAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public expireOn?: Date;

  @IsOptional()
  @ValidateNested()
  public address?: AddressDto;
}

import { IsNotEmpty, IsOptional, IsString, IsEmail, ValidateNested, IsDate, IsEnum } from 'class-validator';
import { AddressDto } from './address.dto';
import { Type } from 'class-transformer';
import { ACCOUNT_ROLES } from "../entities/user.interface";

export class UserDto {

    @IsOptional()
    @IsString()
    public id!: string;

    @IsOptional()
    @IsString()
    public name!: string;

    @IsOptional()
    @IsEmail()
    public email!: string;

    @IsOptional()
    @IsString()
    public password?: string;

    @IsOptional()
    @IsString()
    public phone!: string;

    @IsOptional()
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

    @IsOptional()
    @IsString()
    public githubId?: string;

    @IsString()
    @IsOptional()
    public githubLogin?: string;
}

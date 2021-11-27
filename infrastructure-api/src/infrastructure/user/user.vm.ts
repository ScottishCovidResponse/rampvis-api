import { IsNotEmpty, IsOptional, IsString, IsEmail, ValidateNested, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ROLES } from './roles.enum';
 
export class UserVm {

    @IsOptional()
    @IsString()
    public id?: string;

    @IsOptional()
    @IsString()
    public name?: string;

    @IsOptional()
    @IsEmail()
    public email?: string;

    @IsOptional()
    @IsString()
    public password?: string;

    @IsOptional()
    @IsEnum(ROLES)
    public role?: ROLES;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    public createdAt?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    public expireOn?: Date;

    @IsOptional()
    @IsString()
    public githubId?: string;

    @IsString()
    @IsOptional()
    public githubUsername?: string;
}

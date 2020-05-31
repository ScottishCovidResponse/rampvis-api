import { IsOptional, IsString, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from './user.dto';
import { MemberDto } from '../client/member.dto';
import { ACTIVITY_ACTION } from '../entities/activity.interface';
import { ACTIVITY_TYPE } from '../entities/activity.interface';
import { ACCOUNT_ROLES } from '../entities/account.interface';
import { ParticipantDto } from '../chat/participant.dto';

export class ActivityDto {

  @IsString()
  public id!: string;

  @IsEnum(ACTIVITY_TYPE)
  public type!: ACTIVITY_TYPE;

  @IsEnum(ACTIVITY_ACTION)
  public action!: ACTIVITY_ACTION;

  @IsString()
  public objectId!: string;

  @IsDate()
  @Type(() => Date)
  public createdAt?: Date;

  @IsString()
  public accountId!: string;

  @IsEnum(ACCOUNT_ROLES)
  public accountRole!: ACCOUNT_ROLES;

  @IsOptional()
  @IsString()
  public account?: ParticipantDto;
}

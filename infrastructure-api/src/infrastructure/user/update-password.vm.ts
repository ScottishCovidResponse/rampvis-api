import { IsString } from 'class-validator';

export class UpdatePasswordVm {
  @IsString()
  oldPassword!: string;
  @IsString()
  newPassword!: string;
}

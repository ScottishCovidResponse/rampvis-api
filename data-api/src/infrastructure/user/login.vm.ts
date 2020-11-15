import { IsNotEmpty, IsString, IsEmail } from 'class-validator';


export class LoginVm {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

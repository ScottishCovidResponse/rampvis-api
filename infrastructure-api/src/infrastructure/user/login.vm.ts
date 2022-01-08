import { IsString, IsEmail } from "class-validator";
import { ApiModel, ApiModelProperty } from "swagger-express-ts";

@ApiModel({
  description: "Login data",
  name: "LoginVm",
})
export class LoginVm {
  @ApiModelProperty({
    description: "Registered email address",
    required: true,
    example: "admin@test.com",
  })
  @IsEmail()
  email!: string;

  @ApiModelProperty({
    description: "Valid password",
    required: true,
    example: "pass123",
  })
  @IsString()
  password!: string;
}

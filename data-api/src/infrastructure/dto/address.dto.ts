import { IsString, IsNotEmpty, IsAlpha, Length } from 'class-validator';

export class AddressDto {
  @IsString()
  street!: string;

  @IsString()
  city!: string;

  @IsString()
  country!: string;

  @IsString()
  zip!: string;

  @IsAlpha()
  @IsString()
  @Length(3,3)
  alpha2Code!: string;
}

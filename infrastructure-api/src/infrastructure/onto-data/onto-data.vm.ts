import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";
import { DATA_TYPE, URL_CODE } from "./onto-data-types";

export class OntoDataVm {
  @IsOptional()
  @IsString()
  public id!: string;

  @IsEnum(URL_CODE)
  public urlCode!: URL_CODE;

  @IsString()
  public endpoint!: string;

  @IsEnum(DATA_TYPE)
  public dataType!: DATA_TYPE;

  @IsArray()
  public keywords!: string[];

  @IsString()
  @IsOptional()
  public description!: string;
}

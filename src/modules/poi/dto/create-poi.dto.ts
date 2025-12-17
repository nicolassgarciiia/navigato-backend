import { IsString, IsNumber, IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";

export class CreatePOIDto {
  @IsString()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @Type(() => Number)
  @IsNumber()
  latitud: number;

  @Type(() => Number)
  @IsNumber()
  longitud: number;
}

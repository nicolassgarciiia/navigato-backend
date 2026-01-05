import { IsString, MinLength } from "class-validator";

export class SaveRouteDto {
  @IsString({message: "El nombre de la ruta debe ser un texto"})
  @MinLength(1, {message: "El nombre debe tener más de un carácter"})
  nombre: string;
}

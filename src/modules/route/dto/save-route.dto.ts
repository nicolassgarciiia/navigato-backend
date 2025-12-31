import { IsEmail, IsString, IsNotEmpty } from "class-validator";

export class SaveRouteDto {
  @IsEmail({}, { message: "El formato del correo no es válido" })
  @IsNotEmpty({ message: "El correo es obligatorio" })
  correo: string;

  @IsString({ message: "El nombre de la ruta debe ser un texto" })
  @IsNotEmpty({ message: "El nombre de la ruta es obligatorio" })
  nombre: string;
}

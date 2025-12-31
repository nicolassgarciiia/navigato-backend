import { IsEmail, IsString, IsNotEmpty } from "class-validator";

export class CalculateRouteDto {
  @IsEmail({}, { message: "El formato del correo no es válido" })
  @IsNotEmpty({ message: "El correo es obligatorio" })
  correo: string;

  @IsString({ message: "El origen debe ser un texto" })
  @IsNotEmpty({ message: "El origen es obligatorio" })
  origen: string;

  @IsString({ message: "El destino debe ser un texto" })
  @IsNotEmpty({ message: "El destino es obligatorio" })
  destino: string;

  @IsString({ message: "El método de movilidad debe ser un texto" })
  @IsNotEmpty({ message: "El método de movilidad es obligatorio" })
  metodo: string;
}

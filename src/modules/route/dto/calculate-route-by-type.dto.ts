import { IsEmail, IsString, IsNotEmpty, IsIn } from "class-validator";

export class CalculateRouteByTypeDto {
  @IsEmail({}, { message: "El formato del correo no es válido" })
  @IsNotEmpty({ message: "El correo es obligatorio" })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: "El origen es obligatorio" })
  origen: string;

  @IsString()
  @IsNotEmpty({ message: "El destino es obligatorio" })
  destino: string;

  @IsString()
  @IsNotEmpty({ message: "El método de movilidad es obligatorio" })
  metodo: string;

  @IsIn(["rapida", "corta", "economica"], {
    message: "El tipo de ruta debe ser rapida, corta o economica",
  })
  tipo: "rapida" | "corta" | "economica";
}

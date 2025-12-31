import { IsEmail, IsString, IsNotEmpty } from "class-validator";

export class CalculateRouteCostDto {
  @IsEmail({}, { message: "El formato del correo no es válido" })
  @IsNotEmpty({ message: "El correo es obligatorio" })
  correo: string;

  @IsString({ message: "El nombre del vehículo debe ser un texto" })
  @IsNotEmpty({ message: "El vehículo es obligatorio" })
  vehiculo: string;
}

import { IsEmail, IsNotEmpty } from "class-validator";

export class CalculateRouteCaloriesDto {
  @IsEmail({}, { message: "El formato del correo no es válido" })
  @IsNotEmpty({ message: "El correo es obligatorio" })
  correo: string;
}

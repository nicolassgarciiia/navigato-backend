import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserEmailDto {
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  @IsString({ message: 'El correo debe ser un texto' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  correo: string;
}
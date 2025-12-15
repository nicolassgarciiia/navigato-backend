import { 
  IsEmail, 
  IsString, 
  IsNotEmpty, 
  MinLength, 
  IsBoolean, 
  IsOptional, 
  MaxLength
} from 'class-validator';

export class RegisterUserDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString({ message: 'Los apellidos deben ser un texto' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  apellidos: string;

  @IsEmail({}, { message: 'El formato del correo no es válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(16, { message: 'La contraseña puede tener como máximo 16 caracteres'})
  contraseña: string;

  @IsString()
  @IsNotEmpty({ message: 'Debes repetir la contraseña' })
  repetirContraseña: string;

  @IsBoolean({ message: 'Debes aceptar la política de privacidad' })
  aceptaPoliticaPrivacidad: boolean;
}
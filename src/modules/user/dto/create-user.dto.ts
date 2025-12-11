export class RegisterUserDto {
  nombre: string;
  apellidos: string;
  correo: string;
  contraseña: string;
  repetirContraseña: string;
  aceptaPoliticaPrivacidad: boolean;
}
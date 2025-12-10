export class User {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  contrasenaHash: string;

  constructor(props: Partial<User>) {
    Object.assign(this, props);
  }
}

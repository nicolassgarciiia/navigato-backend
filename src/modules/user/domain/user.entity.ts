export class User {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  contraseña_hash: string;
  listaLugares: any[];
  listaVehiculos: any[];
  listaRutasGuardadas: any[];
  preferencias: any;

  constructor(props: Partial<User>) {
    Object.assign(this, props);
  }
}

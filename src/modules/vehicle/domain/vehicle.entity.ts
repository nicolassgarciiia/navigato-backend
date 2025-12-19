export class Vehicle {
  id: string;
  nombre: string;
  matricula: string;
  tipo: "COMBUSTION" | "ELECTRICO";
  consumo: number;
  favorito: boolean;

  constructor(props: Partial<Vehicle>) {
    Object.assign(this, props);
  }
}

export class Route {
  id: string;
  origen: any;
  destino: any;
  distancia: number;
  duracion: number;
  metodoMovilidad: string;
  tipo: string;
  trayecto?: any[];
  coordenadas?: number[][];
  coste?: any;

  constructor(data: Partial<Route>) {
    Object.assign(this, data);
  }
}

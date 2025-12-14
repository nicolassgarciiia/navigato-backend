export class POI {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  toponimo: string;
  favorito: boolean;

  constructor(props: Partial<POI>) {
    Object.assign(this, props);
  }
}

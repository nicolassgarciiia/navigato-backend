export class Coste {
  tipo: "combustible" | "calorias";
  vehiculoAsociado: string | null;
  costeEnergetico: {
    valor: number;
    unidad: string;
  };
  costeEconomico: number | null;

  constructor(data: Partial<Coste>) {
    Object.assign(this, data);
  }
}

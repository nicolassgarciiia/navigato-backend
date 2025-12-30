import { CostStrategy } from "../../domain/cost-strategy.interface";
import { Coste } from "../../domain/coste.entity";
import { Route } from "../../domain/route.entity";

export class CalorieCostStrategy implements CostStrategy {
  async calculate(route: Route): Promise<Coste> {
    // Aproximación sencilla: 50 kcal por km caminando
    const kcal = (route.distancia / 1000) * 50;

    return new Coste({
      tipo: "calorias",
      vehiculoAsociado: null,
      costeEnergetico: {
        valor: Number(kcal.toFixed(2)),
        unidad: "kcal",
      },
      costeEconomico: null,
    });
  }
}

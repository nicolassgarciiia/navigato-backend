import { CostStrategy } from "../../domain/cost-strategy.interface";
import { Coste } from "../../domain/coste.entity";
import { Route } from "../../domain/route.entity";
import { Vehicle } from "../../../vehicle/domain/vehicle.entity";

export class FuelCostStrategy implements CostStrategy {
  async calculate(route: Route, vehicle: Vehicle): Promise<Coste> {
    const litrosConsumidos =
      (route.distancia / 1000) * (vehicle.consumo / 100);

    const precioLitro = 1.75;

    return new Coste({
      tipo: "combustible",
      vehiculoAsociado: vehicle.nombre,
      costeEnergetico: {
        valor: Number(litrosConsumidos.toFixed(2)),
        unidad: "litros",
      },
      costeEconomico: Number(
        (litrosConsumidos * precioLitro).toFixed(2)
      ),
    });
  }
}

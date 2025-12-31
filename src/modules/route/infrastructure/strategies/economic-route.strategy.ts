import { RouteStrategy } from "../../domain/route-strategy.interface";
import { Route } from "../../domain/route.entity";
import * as crypto from "crypto";

export class EconomicRouteStrategy implements RouteStrategy {
  async calculate(origen: any, destino: any, metodo: string): Promise<Route> {
    return new Route({
      id: crypto.randomUUID(),
      origen,
      destino,
      metodoMovilidad: metodo,
      distancia: 10000,
      duracion: 1200,
      tipo: "economica",
    });
  }
}

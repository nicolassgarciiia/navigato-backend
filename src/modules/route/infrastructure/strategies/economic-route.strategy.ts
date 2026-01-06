import { RouteStrategy } from "../../domain/route-strategy.interface";

export class EconomicRouteStrategy implements RouteStrategy {
  async calculate(origen, destino, metodo, routingAdapter) {
    const route = await routingAdapter.calculate(
      origen,
      destino,
      metodo,
      "economica"
    );

    route.tipo = "economica";
    return route;
  }
}

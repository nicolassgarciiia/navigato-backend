import { RouteStrategy } from "../../domain/route-strategy.interface";

export class ShortestRouteStrategy implements RouteStrategy {
  async calculate(origen, destino, metodo, routingAdapter) {
    const route = await routingAdapter.calculate(
      origen,
      destino,
      metodo,
      "corta"
    );

    route.tipo = "corta";
    return route;
  }
}

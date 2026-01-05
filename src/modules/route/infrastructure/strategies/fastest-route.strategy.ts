import { RouteStrategy } from "../../domain/route-strategy.interface";

export class FastestRouteStrategy implements RouteStrategy {
  async calculate(origen, destino, metodo, routingAdapter) {
    const route = await routingAdapter.calculate(
      origen,
      destino,
      metodo,
      "rapida"
    );

    route.tipo = "rapida";
    return route;
  }
}

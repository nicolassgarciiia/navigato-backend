import { Route } from "./route.entity";
import type { RoutingAdapter } from "../infrastructure/adapters/routing.adapter";

export interface RouteStrategy {
  calculate(
    origen: { lat: number; lng: number },
    destino: { lat: number; lng: number },
    metodo: string,
    routingAdapter: RoutingAdapter
  ): Promise<Route>;
}

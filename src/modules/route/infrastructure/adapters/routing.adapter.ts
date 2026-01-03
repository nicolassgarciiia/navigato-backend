import { Route } from "../../domain/route.entity";

export interface RoutingAdapter {
  calculate(
    origen: { lat: number; lng: number },
    destino: { lat: number; lng: number },
    metodo: string
  ): Promise<Route>;
}

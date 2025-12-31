import { Route } from "../../domain/route.entity";

export interface RoutingAdapter {
  calculate(
    origen: any,
    destino: any,
    metodo: string
  ): Promise<Route>;
}



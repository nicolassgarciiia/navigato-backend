import { Route } from "./route.entity";

export interface RouteStrategy {
  calculate(origen: any, destino: any, metodo: string): Promise<Route>;
}

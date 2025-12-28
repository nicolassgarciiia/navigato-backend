import { Route } from "./route.entity";
import { Vehicle } from "../../vehicle/domain/vehicle.entity";
import { Coste } from "./coste.entity";

export interface CostStrategy {
  calculate(route: Route, vehicle?: Vehicle): Promise<Coste>;
}

import { Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../user/domain/user.repository";
import { POIRepository } from "../../poi/domain/poi.repository";
import type { RoutingAdapter } from "../infrastructure/adapters/routing.adapter";
import { Route } from "../domain/route.entity";
import { VehicleRepository } from "../../vehicle/domain/vehicle.repository";
import { FuelCostStrategy } from "../infrastructure/strategies/fuel-cost.strategy";
import { CalorieCostStrategy } from "../infrastructure/strategies/calorie-cost.strategy";
import { FastestRouteStrategy } from "../infrastructure/strategies/fastest-route.strategy";
import { ShortestRouteStrategy } from "../infrastructure/strategies/shortest-route.strategy";
import { EconomicRouteStrategy } from "../infrastructure/strategies/economic-route.strategy";
import { RouteRepository } from "../domain/route.repository";
import { SavedRoute } from "../domain/saved-route.entity";



@Injectable()
export class RouteService {

  private lastCalculatedRoute: Route | null = null;
  private fuelCostStrategy = new FuelCostStrategy();
  private calorieCostStrategy = new CalorieCostStrategy();
  private fastestRouteStrategy = new FastestRouteStrategy();
  private shortestRouteStrategy = new ShortestRouteStrategy();
  private economicRouteStrategy = new EconomicRouteStrategy();



  constructor(
    private userRepository: UserRepository,
    private poiRepository: POIRepository,
    private vehicleRepository: VehicleRepository,
    private routeRepository: RouteRepository,
    @Inject("RoutingAdapter")
    private routingAdapter: RoutingAdapter
  ) {}

  // ======================================================
  // HU13 – Calcular ruta
  // ======================================================
  async calculateRoute(
    email: string,
    origenName: string,
    destinoName: string,
    metodo: string
  ): Promise<Route> {

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("AuthenticationRequiredError");
    }

    const pois = await this.poiRepository.findByUser(user.id);

    const origen = pois.find((p) => p.nombre === origenName);
    const destino = pois.find((p) => p.nombre === destinoName);

    if (!origen || !destino) {
      throw new Error("InvalidPlaceOfInterestError");
    }

    try {
      const route = await this.routingAdapter.calculate(origen, destino, metodo);
      this.lastCalculatedRoute = route;
      return route;
    } catch {
      throw new Error("RoutingServiceUnavailableError");
    }
  }

  // ======================================================
// HU14 – Calcular coste de ruta en vehículo
// ======================================================
async calculateRouteCostWithVehicle(
  email: string,
  vehicleName: string
) {

  const user = await this.userRepository.findByEmail(email);
  if (!user) {
    throw new Error("AuthenticationRequiredError");
  }

  const vehicles = await this.vehicleRepository.findByUser(user.id);
  const vehicle = vehicles.find((v) => v.nombre === vehicleName);

  if (!vehicle) {
    throw new Error("VehicleNotFoundError");
  }

  const route = this.lastCalculatedRoute;
  if (!route) {
    throw new Error("InvalidRouteError");
  }

  try {
    const cost = await this.fuelCostStrategy.calculate(route, vehicle);
    route.coste = cost;
    return cost;
  } catch {
    throw new Error("FuelServiceUnavailableError");
  }
}

// ======================================================
// HU15 – Calcular coste calórico de una ruta
// ======================================================
async calculateRouteCalories(email: string) {

  const user = await this.userRepository.findByEmail(email);
  if (!user) {
    throw new Error("AuthenticationRequiredError");
  }

  if (!this.lastCalculatedRoute) {
    throw new Error("InvalidRouteError");
  }

  try {
    const cost = await this.calorieCostStrategy.calculate(
      this.lastCalculatedRoute
    );
    this.lastCalculatedRoute.coste = cost;
    return cost;
  } catch {
    throw new Error("CalorieServiceUnavailableError");
  }
}

// ======================================================
// HU16 – Calcular ruta según criterio
// ======================================================
async calculateRouteByType(
  email: string,
  origenName: string,
  destinoName: string,
  metodo: string,
  tipo: "rapida" | "corta" | "economica"
): Promise<Route> {

  const user = await this.userRepository.findByEmail(email);
  if (!user) {
    throw new Error("AuthenticationRequiredError");
  }

  const pois = await this.poiRepository.findByUser(user.id);

  const origen = pois.find(p => p.nombre === origenName);
  const destino = pois.find(p => p.nombre === destinoName);

  if (!origen || !destino) {
    throw new Error("InvalidPlaceOfInterestError");
  }

  let route: Route;

  switch (tipo) {
    case "rapida":
      route = await this.fastestRouteStrategy.calculate(
        origen,
        destino,
        metodo
      );
      break;
    case "corta":
      route = await this.shortestRouteStrategy.calculate(
        origen,
        destino,
        metodo
      );
      break;
    case "economica":
      route = await this.economicRouteStrategy.calculate(
        origen,
        destino,
        metodo
      );
      break;
    default:
      throw new Error("InvalidRouteTypeError");
  }

  this.lastCalculatedRoute = route;
  return route;
}

// ======================================================
// HU17 – Guardar ruta
// ======================================================
async saveRoute(
  email: string,
  name: string
) {

  const user = await this.userRepository.findByEmail(email);
  if (!user) {
    throw new Error("AuthenticationRequiredError");
  }

  if (!this.lastCalculatedRoute) {
    throw new Error("InvalidRouteError");
  }

  const existing = await this.routeRepository.findByName(
    user.id,
    name
  );
  if (existing) {
    throw new Error("RouteAlreadyExistsError");
  }

  const saved = new SavedRoute({
    nombre: name,
    route: this.lastCalculatedRoute,
    favorito: false,
    fechaGuardado: new Date(),
  });

  await this.routeRepository.save(user.id, saved);
  return saved;
}

// ======================================================
// HU18 – Listar rutas guardadas
// ======================================================
async listSavedRoutes(email: string) {
  const user = await this.userRepository.findByEmail(email);
  if (!user) {
    throw new Error("AuthenticationRequiredError");
  }

  return this.routeRepository.findByUser(user.id);
}

// ======================================================
// HU19 – Eliminar ruta guardada
// ======================================================
async deleteSavedRoute(
  email: string,
  name: string
): Promise<void> {

  const user = await this.userRepository.findByEmail(email);
  if (!user) {
    throw new Error("AuthenticationRequiredError");
  }

  const route = await this.routeRepository.findByName(
    user.id,
    name
  );
  if (!route) {
    throw new Error("RouteNotFoundError");
  }

  await this.routeRepository.delete(user.id, name);
}


}

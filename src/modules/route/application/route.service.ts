import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../../user/domain/user.repository";
import { POIRepository } from "../../poi/domain/poi.repository";
import { VehicleRepository } from "../../vehicle/domain/vehicle.repository";
import { RouteRepository } from "../domain/route.repository";
import type { RoutingAdapter } from "../infrastructure/adapters/routing.adapter";
import { Route } from "../domain/route.entity";
import { SavedRoute } from "../domain/saved-route.entity";

import {
  AuthenticationRequiredError,
  RouteNotCalculatedError,
  VehicleNotFoundError,
  NameAlreadyExistsError,
  SavedRouteNotFoundError,
  FuelServiceUnavailableError,
  CalorieServiceUnavailableError,
  InvalidRouteTypeError,
} from "../domain/errors";

import { FuelCostStrategy } from "../infrastructure/strategies/fuel-cost.strategy";
import { CalorieCostStrategy } from "../infrastructure/strategies/calorie-cost.strategy";
import { UserPreferencesService } from "../../user-preferences/application/user-preferences.service";
type RouteType = "rapida" | "corta" | "economica";
@Injectable()
export class RouteService {
  private lastCalculatedRoutes = new Map<string, Route>();

  private fuelCostStrategy = new FuelCostStrategy();
  private calorieCostStrategy = new CalorieCostStrategy();


  constructor(
    private readonly userRepository: UserRepository,
    private readonly poiRepository: POIRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly routeRepository: RouteRepository,
    private readonly userPreferencesService: UserPreferencesService,
    @Inject("RoutingAdapter")
    private readonly routingAdapter: RoutingAdapter
  ) {}

  // ======================================================
  // HU13 – Calcular ruta
  // ======================================================
  async calculateRoute(
    email: string,
    origen: { lat: number; lng: number },
    destino: { lat: number; lng: number },
    metodo: string
  ): Promise<Route> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AuthenticationRequiredError();
    

    const route = await this.routingAdapter.calculate(origen, destino, metodo);

    this.lastCalculatedRoutes.set(user.id, route);

    return route;
  }

  async calculateRouteCost(
    email: string,
    metodo: "vehiculo" | "pie" | "bici",
    vehicleName?: string
  ) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AuthenticationRequiredError();

    const route = this.lastCalculatedRoutes.get(user.id);
    if (!route) throw new RouteNotCalculatedError();

    switch (metodo) {
      case "vehiculo": {
        if (!vehicleName) {
          throw new VehicleNotFoundError();
        }

        const vehicles = await this.vehicleRepository.findByUser(user.id);
        const vehicle = vehicles.find(v => v.nombre === vehicleName);
        if (!vehicle) throw new VehicleNotFoundError();

        return this.fuelCostStrategy.calculate(route, vehicle);
      }

      case "pie":
      case "bici":
        return this.calorieCostStrategy.calculate(route);

      default:
        throw new InvalidRouteTypeError();
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
    if (!user) throw new AuthenticationRequiredError();

    const vehicles = await this.vehicleRepository.findByUser(user.id);
    const vehicle = vehicles.find(v => v.nombre === vehicleName);
    if (!vehicle) throw new VehicleNotFoundError();

    const route = this.lastCalculatedRoutes.get(user.id);
    if (!route) throw new RouteNotCalculatedError();

    try {
      const cost = await this.fuelCostStrategy.calculate(route, vehicle);
      route.coste = cost;
      return cost;
    } catch {
      throw new FuelServiceUnavailableError();
    }
  }

  // ======================================================
  // HU15 – Calcular coste calórico
  // ======================================================
  async calculateRouteCalories(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AuthenticationRequiredError();

    const route = this.lastCalculatedRoutes.get(user.id);
    if (!route) throw new RouteNotCalculatedError();

    try {
      const cost = await this.calorieCostStrategy.calculate(route);
      route.coste = cost;
      return cost;
    } catch {
      throw new CalorieServiceUnavailableError();
    }
  }

  // ======================================================
  // HU16 – Calcular ruta por tipo
  // ======================================================
async calculateRouteByType(
  email: string,
  origen: { lat: number; lng: number },
  destino: { lat: number; lng: number },
  metodo: string,
  tipo?: "rapida" | "corta" | "economica"
): Promise<Route> {
  const user = await this.userRepository.findByEmail(email);
  if (!user) {
    throw new AuthenticationRequiredError();
  }

  // 1 Obtener preferencias
  const preferences =
    await this.userPreferencesService.getByUser(email);

  // 2 Resolver tipo final
  let tipoFinal: RouteType;

  if (tipo) {
    tipoFinal = tipo;
  } else if (
    preferences.defaultRouteType === "rapida" ||
    preferences.defaultRouteType === "corta" ||
    preferences.defaultRouteType === "economica"
  ) {
    tipoFinal = preferences.defaultRouteType;
  } else {
    tipoFinal = "economica";
  }

  // 3 Mapear a ORS preference
  let orsPreference: "fastest" | "shortest" | "recommended";

  switch (tipoFinal) {
    case "rapida":
      orsPreference = "fastest";
      break;
    case "corta":
      orsPreference = "shortest";
      break;
    case "economica":
    default:
      orsPreference = "recommended";
      break;
  }

  // 4 Llamar al adapter (AQUÍ está la diferencia real)
  const route = await this.routingAdapter.calculate(
    origen,
    destino,
    metodo,
    orsPreference
  );

  // 5 Marcar tipo en la entidad
  route.tipo = tipoFinal;

  this.lastCalculatedRoutes.set(user.id, route);
  return route;
}





// ======================================================
// HU17 – Guardar ruta
// ======================================================
async saveRoute(email: string, name: string): Promise<SavedRoute> {
  const user = await this.userRepository.findByEmail(email);
  if (!user) throw new AuthenticationRequiredError();

  const route = this.lastCalculatedRoutes.get(user.id);
  if (!route) throw new RouteNotCalculatedError();

  const existing = await this.routeRepository.findByName(user.id, name);
  if (existing) throw new NameAlreadyExistsError();

  const saved = new SavedRoute({
    nombre: name,
    route,
    favorito: false,
    fechaGuardado: new Date(),
  });

  await this.routeRepository.save(user.id, saved);
  this.lastCalculatedRoutes.delete(user.id);

  return saved;
}


  // ======================================================
  // HU18 – Listar rutas guardadas
  // ======================================================
  async listSavedRoutes(email: string): Promise<SavedRoute[]> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AuthenticationRequiredError();

    return this.routeRepository.findByUser(user.id);
  }

    // ======================================================
  // HU19 – Eliminar ruta guardada (método oficial del caso de uso)
  // ======================================================
  async deleteSavedRoute(email: string, name: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationRequiredError();
    }

    const route = await this.routeRepository.findByName(user.id, name);
    if (!route) {
      throw new SavedRouteNotFoundError();
    }

    await this.routeRepository.delete(user.id, name);
  }
  async toggleRouteFavorite(email: string, name: string): Promise<void> {
  const user = await this.userRepository.findByEmail(email);
  if (!user) throw new AuthenticationRequiredError();

  const route = await this.routeRepository.findByName(user.id, name);
  if (!route) throw new SavedRouteNotFoundError();

  route.favorito = !route.favorito;
  await this.routeRepository.update(user.id, route);
}



  /**
   * Alias auxiliar para tests / compatibilidad histórica
   * (muchos tests llaman a routeService.delete(...))
   */
  async delete(email: string, name: string): Promise<void> {
    return this.deleteSavedRoute(email, name);
  }


}

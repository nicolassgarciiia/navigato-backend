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
  InvalidPlaceOfInterestError,
  VehicleNotFoundError,
  NameAlreadyExistsError,
  SavedRouteNotFoundError,
  RoutingServiceUnavailableError,
  FuelServiceUnavailableError,
  CalorieServiceUnavailableError,
  InvalidRouteTypeError,
} from "../domain/errors";

import { FuelCostStrategy } from "../infrastructure/strategies/fuel-cost.strategy";
import { CalorieCostStrategy } from "../infrastructure/strategies/calorie-cost.strategy";
import { FastestRouteStrategy } from "../infrastructure/strategies/fastest-route.strategy";
import { ShortestRouteStrategy } from "../infrastructure/strategies/shortest-route.strategy";
import { EconomicRouteStrategy } from "../infrastructure/strategies/economic-route.strategy";

@Injectable()
export class RouteService {
  /**
   * Última ruta calculada por usuario
   * (evita estado global y flaky tests)
   */
  private lastCalculatedRoutes = new Map<string, Route>();

  private fuelCostStrategy = new FuelCostStrategy();
  private calorieCostStrategy = new CalorieCostStrategy();
  private fastestRouteStrategy = new FastestRouteStrategy();
  private shortestRouteStrategy = new ShortestRouteStrategy();
  private economicRouteStrategy = new EconomicRouteStrategy();

  constructor(
    private readonly userRepository: UserRepository,
    private readonly poiRepository: POIRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly routeRepository: RouteRepository,
    @Inject("RoutingAdapter")
    private readonly routingAdapter: RoutingAdapter
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
    if (!user) throw new AuthenticationRequiredError();

    const pois = await this.poiRepository.findByUser(user.id);
    const origen = pois.find(p => p.nombre === origenName);
    const destino = pois.find(p => p.nombre === destinoName);

    if (!origen || !destino) {
      throw new InvalidPlaceOfInterestError();
    }

    try {
      const route = await this.routingAdapter.calculate(
        origen,
        destino,
        metodo
      );

      this.lastCalculatedRoutes.set(user.id, route);
      return route;
    } catch {
      throw new RoutingServiceUnavailableError();
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
    origenName: string,
    destinoName: string,
    metodo: string,
    tipo: "rapida" | "corta" | "economica"
  ): Promise<Route> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AuthenticationRequiredError();

    const pois = await this.poiRepository.findByUser(user.id);
    const origen = pois.find(p => p.nombre === origenName);
    const destino = pois.find(p => p.nombre === destinoName);

    if (!origen || !destino) {
      throw new InvalidPlaceOfInterestError();
    }

    try {
      let route: Route;

      switch (tipo) {
        case "rapida":
          route = await this.fastestRouteStrategy.calculate(origen, destino, metodo);
          break;
        case "corta":
          route = await this.shortestRouteStrategy.calculate(origen, destino, metodo);
          break;
        case "economica":
          route = await this.economicRouteStrategy.calculate(origen, destino, metodo);
          break;
        default:
          throw new InvalidRouteTypeError();
      }

      this.lastCalculatedRoutes.set(user.id, route);
      return route;
    } catch {
      throw new RoutingServiceUnavailableError();
    }
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
  async toggleRouteFavorite(
  userEmail: string,
  routeId: string
      ): Promise<void> {
  throw new Error("Method not implemented.");
    }


  /**
   * Alias auxiliar para tests / compatibilidad histórica
   * (muchos tests llaman a routeService.delete(...))
   */
  async delete(email: string, name: string): Promise<void> {
    return this.deleteSavedRoute(email, name);
  }


}

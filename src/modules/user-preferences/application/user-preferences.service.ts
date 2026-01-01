import { Injectable } from "@nestjs/common";
import { UserPreferencesRepository } from "../domain/user-preferences.repository";
import { UserRepository } from "../../user/domain/user.repository";
import { VehicleRepository } from "../../vehicle/domain/vehicle.repository";
import { UserPreferences } from "../domain/user-preferences.entity";

import {
  AuthenticationRequiredError,
  ElementNotFoundError,
  DatabaseConnectionError,
  InvalidRouteTypeError,
} from "../domain/errors";

const VALID_ROUTE_TYPES = ["rapida", "corta", "economica"];

@Injectable()
export class UserPreferencesService {
  constructor(
    private readonly preferencesRepository: UserPreferencesRepository,
    private readonly userRepository: UserRepository,
    private readonly vehicleRepository: VehicleRepository
  ) {}

  // ======================================================
  // HU21 – Establecer vehículo por defecto
  // ======================================================
  async setDefaultVehicle(
    userEmail: string,
    vehicleId: string
  ): Promise<void> {
    const user = await this.userRepository.findByEmail(userEmail);
    if (!user) {
      throw new AuthenticationRequiredError();
    }

    let vehicle;
    try {
      vehicle = await this.vehicleRepository.findByIdAndUser(
        vehicleId,
        user.id
      );
    } catch {
      throw new DatabaseConnectionError();
    }

    if (!vehicle) {
      throw new ElementNotFoundError();
    }

    try {
      await this.preferencesRepository.setDefaultVehicle(
        user.id,
        vehicle.id
      );
    } catch {
      throw new DatabaseConnectionError();
    }
  }

  // ======================================================
  // HU22 – Establecer tipo de ruta por defecto
  // ======================================================
  async setDefaultRouteType(
    userEmail: string,
    routeType: string
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  // ======================================================
  // Obtener preferencias del usuario
  // ======================================================
  async getByUser(userEmail: string): Promise<UserPreferences> {
    const user = await this.userRepository.findByEmail(userEmail);
    if (!user) {
      throw new AuthenticationRequiredError();
    }

    try {
      return (
        (await this.preferencesRepository.findByUserId(user.id)) ??
        new UserPreferences({ userId: user.id })
      );
    } catch {
      throw new DatabaseConnectionError();
    }
  }
}

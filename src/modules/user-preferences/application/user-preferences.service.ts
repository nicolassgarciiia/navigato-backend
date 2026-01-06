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
    const user = await this.userRepository.findByEmail(userEmail);
    if (!user) {
      throw new AuthenticationRequiredError();
    }

    if (!VALID_ROUTE_TYPES.includes(routeType)) {
      throw new InvalidRouteTypeError();
    }

    try {
      await this.preferencesRepository.setDefaultRouteType(
        user.id,
        routeType
      );
    } catch {
      throw new DatabaseConnectionError();
    }
  }
// ======================================================
// Quitar vehículo por defecto (NUEVO)
// ======================================================
async clearDefaultVehicle(userEmail: string): Promise<void> {
  const user = await this.userRepository.findByEmail(userEmail);
  if (!user) {
    throw new AuthenticationRequiredError();
  }

  try {
    await this.preferencesRepository.clearDefaultVehicle(user.id);
  } catch {
    throw new DatabaseConnectionError();
  }
}

// ======================================================
// Obtener preferencias del usuario (DEFINITIVO)
// ======================================================

async getByUser(userEmail: string): Promise<UserPreferences> {
  const user = await this.userRepository.findByEmail(userEmail);
  if (!user) {
    throw new AuthenticationRequiredError();
  }

  let prefs: UserPreferences | null = null;

  try {
    prefs = await this.preferencesRepository.findByUserId(user.id);
  } catch {
    // si falla la BD, lanzamos error
    throw new DatabaseConnectionError();
  }

  return new UserPreferences({
    userId: user.id,
    defaultVehicleId: prefs?.defaultVehicleId,
    defaultRouteType: prefs?.defaultRouteType,
  });
}

}


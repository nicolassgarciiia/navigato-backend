import { Injectable } from "@nestjs/common";
import { UserPreferencesRepository } from "../domain/user-preferences.repository";
import { UserRepository } from "../../user/domain/user.repository";
import { VehicleRepository } from "../../vehicle/domain/vehicle.repository";
import { UserPreferences } from "../domain/user-preferences.entity";

import {
  AuthenticationRequiredError,
  ElementNotFoundError,
  DatabaseConnectionError,
} from "../domain/errors";

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
    // 1️⃣ Usuario autenticado
    const user = await this.userRepository.findByEmail(userEmail);
    if (!user) {
      throw new AuthenticationRequiredError();
    }

    // 2️⃣ El vehículo debe existir y pertenecer al usuario
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

    // 3️⃣ Guardar preferencia
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
  // Obtener preferencias del usuario
  // ======================================================
  async getByUser(userEmail: string): Promise<UserPreferences> {
    const user = await this.userRepository.findByEmail(userEmail);
    if (!user) {
      throw new AuthenticationRequiredError();
    }

    try {
      const prefs =
        (await this.preferencesRepository.findByUserId(user.id)) ??
        new UserPreferences({ userId: user.id });

      return prefs;
    } catch {
      throw new DatabaseConnectionError();
    }
  }
}

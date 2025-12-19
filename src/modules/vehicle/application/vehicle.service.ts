import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

import { Vehicle } from "../domain/vehicle.entity";
import { VehicleRepository } from "../domain/vehicle.repository";
import { UserRepository } from "../../user/domain/user.repository";

import {
  AuthenticationRequiredError,
  DatabaseConnectionError,
  InvalidVehicleConsumptionError,
} from "../domain/errors";

@Injectable()
export class VehicleService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly userRepository: UserRepository
  ) {}

  // ======================================================
  // HU09 – Alta de vehículo
  // ======================================================
  async createVehicle(
    userEmail: string,
    nombre: string,
    matricula: string,
    tipo: "COMBUSTION" | "ELECTRICO",
    consumo: number
  ): Promise<Vehicle> {
    const user = await this.getAuthenticatedUser(userEmail);

    this.validateConsumption(consumo);

    const vehicle = this.createVehicleEntity({
      nombre,
      matricula,
      tipo,
      consumo,
    });

    await this.saveVehicle(vehicle, user.id);

    return vehicle;
  }

  // ======================================================
  // Helpers privados
  // ======================================================

  private async getAuthenticatedUser(userEmail: string) {
    const user = await this.userRepository.findByEmail(userEmail);
    if (!user) {
      throw new AuthenticationRequiredError();
    }
    return user;
  }

  private validateConsumption(consumo: number) {
    // HU09_E02: consumo negativo -> error
    if (consumo == null || Number.isNaN(consumo) || consumo < 0) {
      throw new InvalidVehicleConsumptionError();
    }
  }

  private createVehicleEntity(data: {
    nombre: string;
    matricula: string;
    tipo: "COMBUSTION" | "ELECTRICO";
    consumo: number;
  }): Vehicle {
    return new Vehicle({
      id: randomUUID(),
      favorito: false,
      ...data,
    });
  }

  private async saveVehicle(vehicle: Vehicle, userId: string) {
    try {
      await this.vehicleRepository.save(vehicle, userId);
    } catch {
      throw new DatabaseConnectionError();
    }
  }
}

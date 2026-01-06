import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

import { Vehicle } from "../domain/vehicle.entity";
import { VehicleRepository } from "../domain/vehicle.repository";
import { UserRepository } from "../../user/domain/user.repository";

import {
  AuthenticationRequiredError,
  DatabaseConnectionError,
  InvalidVehicleConsumptionError,
  VehicleNotFoundError,
} from "../domain/errors";

type UpdateVehicleData = {
  nombre?: string;
  matricula?: string;
  tipo?: "COMBUSTION" | "ELECTRICO";
  consumo?: number;
  favorito?: boolean;
};

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
    const user = await this.getUserByEmail(userEmail);

    this.validateConsumption(consumo);

    const vehicle = this.createVehicleEntity({
      nombre,
      matricula,
      tipo,
      consumo,
    });

    await this.persistVehicle(vehicle, user.id);

    return vehicle;
  }

  // ======================================================
  // HU10 – Listado de vehículos del usuario
  // ======================================================
  async listByUser(authUser: any): Promise<Vehicle[]> {
  const userId = authUser?.id;

  if (!userId) {
    throw new AuthenticationRequiredError();
  }

  const user = await this.userRepository.findById(userId);
  if (!user) {
    throw new AuthenticationRequiredError();
  }

  try {
    return await this.vehicleRepository.findByUser(user.id);
  } catch {
    throw new DatabaseConnectionError();
  }
}



  // ======================================================
  // HU11 – Borrado de vehículo
  // ======================================================
  async deleteVehicle(userEmail: string, vehicleId: string): Promise<void> {
    const vehicle = await this.getUserVehicleOrFail(userEmail, vehicleId);

    try {
      await this.vehicleRepository.delete(vehicle.id);
    } catch {
      throw new DatabaseConnectionError();
    }
  }

  // ======================================================
  // HU12 – Modificar vehículo (parcial)
  // ======================================================
  async updateVehicle(
    userEmail: string,
    vehicleId: string,
    data: UpdateVehicleData
  ): Promise<void> {
    const vehicle = await this.getUserVehicleOrFail(userEmail, vehicleId);

    if (data.consumo !== undefined) {
      this.validateConsumption(data.consumo);
    }

    Object.assign(vehicle, data);

    try {
      await this.vehicleRepository.update(vehicle);
    } catch {
      throw new DatabaseConnectionError();
    }
  }
  async delete(vehicleId: string): Promise<void> {
  await this.vehicleRepository.delete(vehicleId);
}
async toggleVehicleFavorite(
  userEmail: string,
  vehicleId: string
): Promise<void> {
  const user = await this.getUserByEmail(userEmail);

  const vehicle = await this.vehicleRepository.findByIdAndUser(
    vehicleId,
    user.id
  );

  if (!vehicle) {
    throw new VehicleNotFoundError();
  }

  vehicle.favorito = !vehicle.favorito;

  try {
    await this.vehicleRepository.update(vehicle);
  } catch {
    throw new DatabaseConnectionError();
  }
}



  // ======================================================
  // Helpers privados
  // ======================================================

  private async getUserByEmail(email: string) {
  const user = await this.userRepository.findByEmail(email);

  if (!user) {
    throw new AuthenticationRequiredError(); // 
  }

  return user;
}


  private async getUserVehicleOrFail(
    userEmail: string,
    vehicleId: string
  ): Promise<Vehicle> {
    const user = await this.getUserByEmail(userEmail);

    let vehicle: Vehicle | null;
    try {
      vehicle = await this.vehicleRepository.findByIdAndUser(
        vehicleId,
        user.id
      );
    } catch {
      throw new VehicleNotFoundError();
    }

    if (!vehicle) {
      throw new VehicleNotFoundError();
    }

    return vehicle;
  }

  private validateConsumption(consumo: number) {
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

  private async persistVehicle(vehicle: Vehicle, userId: string) {
    try {
      await this.vehicleRepository.save(vehicle, userId);
    } catch {
      throw new DatabaseConnectionError();
    }
  }
}

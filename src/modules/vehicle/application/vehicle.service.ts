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
  ): Promise<Vehicle> { throw new Error ("Not Implemented")
  }
}  
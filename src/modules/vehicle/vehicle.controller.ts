import {
  Controller,
  Post,
  Body,
} from "@nestjs/common";
import { VehicleService } from "./application/vehicle.service";

@Controller("vehicles")
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  // =====================================================
  // HU09 – Alta de vehículo
  // =====================================================
  @Post()
  async create(@Body() body: any) {
    return this.vehicleService.createVehicle(
      body.correo,
      body.nombre,
      body.matricula,
      body.tipo,
      body.consumo
    );
  }
}



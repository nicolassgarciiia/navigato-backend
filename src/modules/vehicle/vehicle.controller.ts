import {
  Controller,
  Post,
  Body,
  Get, 
  Query,
  Delete,
  Param,
  Put,
} from "@nestjs/common";
import { VehicleService } from "./application/vehicle.service";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";

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
  // =====================================================
  // HU10 – Listar vehículos
  // =====================================================
  @Get()
  async list(@Query("correo") correo: string) {
    return this.vehicleService.listByUser(correo);
  }
  // =====================================================
  // HU11 – Borrado de vehículo
  // =====================================================
  @Delete(":id")
  async delete(
    @Param("id") id: string,
    @Query("correo") correo: string
  ) {
    await this.vehicleService.deleteVehicle(correo, id);
    return { ok: true };
  }
  // =====================================================
// HU12 – Actualizar vehículo
// =====================================================
@Put(":id")
async update(
  @Param("id") id: string,
  @Body() body: UpdateVehicleDto,
  @Query("correo") correo: string
) {
  await this.vehicleService.updateVehicle(
    correo,
    id,
    body
  );

  return { ok: true };
}

}



import {
  Controller,
  Post,
  Body,
  Get, 
  Query,
  Delete,
  Param,
  Put,
  Req,
  UseGuards
} from "@nestjs/common";
import { VehicleService } from "./application/vehicle.service";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { SupabaseAuthGuard } from "src/auth/supabase-auth.guard";

@Controller("vehicles")
@UseGuards(SupabaseAuthGuard)
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
  async list(@Req() req: any) {
    console.log("REQ.USER: ", req.user);
    return this.vehicleService.listByUser(req.user);
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

@Put(':id')
async updateVehicle(
  @Param('id') id: string,
  @Query('correo') correo: string,
  @Body() dto: UpdateVehicleDto,
) {
  await this.vehicleService.updateVehicle(correo, id, dto);
}
}





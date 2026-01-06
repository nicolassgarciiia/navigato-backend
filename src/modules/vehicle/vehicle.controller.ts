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
import { SupabaseAuthGuard } from "../../auth/supabase-auth.guard";

@Controller("vehicles")
@UseGuards(SupabaseAuthGuard)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  // =====================================================
  // HU09 – Alta de vehículo
  // =====================================================
  @Post()
async create(@Req() req: any, @Body() body: any) {
  console.log("BODY RECIBIDO EN CONTROLLER:", body);

  return this.vehicleService.createVehicle(
    req.user.email,
    body.nombre,
    body.matricula,
    body.tipo,
    body.consumo,
    body.favorito ?? false
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
// HU20 – Marcar vehículo como favorito
@Post(":id/favorite")
async toggleFavorite(
  @Param("id") id: string,
  @Req() req: any
) {
  const favorito = await this.vehicleService.toggleVehicleFavorite(
    req.user.email,
    id
  );

  return { ok: true, data: { favorito } };
}


}





import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  UseFilters,
  Req,
  UseGuards
} from "@nestjs/common";
import { RouteService } from "./application/route.service";
import { RouteExceptionFilter } from "./route-exception.filter";
import { CalculateRouteDto } from "./dto/calculate-route.dto";
import { CalculateRouteByTypeDto } from "./dto/calculate-route-by-type.dto";
import { CalculateRouteCostDto } from "./dto/calculate-route-cost.dto";
import { CalculateRouteCaloriesDto } from "./dto/calculate-route-calories.dto";
import { SaveRouteDto } from "./dto/save-route.dto";
import { SupabaseAuthGuard } from "src/auth/supabase-auth.guard";

@Controller("routes")
@UseGuards(SupabaseAuthGuard)
//@UseFilters(RouteExceptionFilter)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  // =====================================================
  // HU13 – Calcular ruta
  // =====================================================
  @Post("calculate")
async calculateRoute(
  @Body() dto: CalculateRouteDto,
  @Req() req: any
) {
  const correo = req.user?.email;

  return this.routeService.calculateRoute(
    correo,
    dto.origen,
    dto.destino,
    dto.metodo
  );
}

  // =====================================================
  // HU14 – Calcular coste de ruta en vehículo
  // =====================================================
  @Post("cost/vehicle")
  async calculateRouteCost(@Body() dto: CalculateRouteCostDto) {
    return this.routeService.calculateRouteCostWithVehicle(
      dto.correo,
      dto.vehiculo
    );
  }

  // =====================================================
  // HU15 – Calcular coste calórico
  // =====================================================
  @Post("cost/calories")
  async calculateRouteCalories(@Body() dto: CalculateRouteCaloriesDto) {
    return this.routeService.calculateRouteCalories(dto.correo);
  }

  // =====================================================
  // HU16 – Calcular ruta por tipo
  // =====================================================
  @Post("calculate/by-type")
  async calculateRouteByType(@Body() dto: CalculateRouteByTypeDto) {
    return this.routeService.calculateRouteByType(
      dto.correo,
      dto.origen,
      dto.destino,
      dto.metodo,
      dto.tipo
    );
  }

  // =====================================================
  // HU17 – Guardar ruta
  // =====================================================
  @Post("save")
  async saveRoute(@Body() dto: SaveRouteDto) {
    return this.routeService.saveRoute(dto.correo, dto.nombre);
  }

  // =====================================================
  // HU18 – Listar rutas guardadas
  // =====================================================
  @Get()
  async listSavedRoutes(@Query("correo") correo: string) {
    return this.routeService.listSavedRoutes(correo);
  }

  // =====================================================
  // HU19 – Eliminar ruta guardada
  // =====================================================
  @Delete()
  async deleteRoute(
    @Query("correo") correo: string,
    @Query("nombre") nombre: string
  ) {
    await this.routeService.delete(correo, nombre);
    return { ok: true };
  }
}

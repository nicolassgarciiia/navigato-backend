import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  UseFilters,
  Req,
  Param,
  Patch,
  UseGuards
} from "@nestjs/common";
import { RouteService } from "./application/route.service";
import { RouteExceptionFilter } from "./route-exception.filter";
import { CalculateRouteDto } from "./dto/calculate-route.dto";
import { CalculateRouteByTypeDto } from "./dto/calculate-route-by-type.dto";
import { CalculateRouteCostDto } from "./dto/calculate-route-cost.dto";
import { SaveRouteDto } from "./dto/save-route.dto";
import { SupabaseAuthGuard } from "../../../src/auth/supabase-auth.guard";


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
  async calculateRouteCost(
    @Body() dto: CalculateRouteCostDto,
    @Req() req: any
  ) {
    const email = req.user?.email;
    return this.routeService.calculateRouteCostWithVehicle(
      email,
      dto.vehiculo
    );
  }


  // =====================================================
  // HU15 – Calcular coste calórico
  // =====================================================
  @Post("cost/calories")
  calculateRouteCalories(@Req() req: any) {
    const email = req.user?.email;
    return this.routeService.calculateRouteCalories(email);
  }

  // =====================================================
  // HU16 – Calcular ruta por tipo
  // =====================================================
  @Post("calculate/by-type")
  async calculateRouteByType(
    @Body() dto: CalculateRouteByTypeDto,
    @Req() req: any
  ) {
    const email = req.user?.email;

    return this.routeService.calculateRouteByType(
      email,
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
  async saveRoute(@Body() dto: SaveRouteDto, @Req() req: any) {
    const correo = req.user?.email;
    return this.routeService.saveRoute(correo, dto.nombre);
  }

  // =====================================================
  // HU18 – Listar rutas guardadas
  // =====================================================
  @Get()
  async listSavedRoutes(@Req() req: any) {
    const email = req.user?.email;
    return this.routeService.listSavedRoutes(email);
  }


  // =====================================================
  // HU19 – Eliminar ruta guardada
  // =====================================================
  @Delete(":name")
  async deleteRoute(@Param("name") name: string, @Req() req: any) {
    const correo = req.user?.email;
    return this.routeService.deleteSavedRoute(correo, name);
  }


  // =====================================================
  // HU20 – Marcar ruta Favorita
  // =====================================================
  @Post(":name/favorite")
async toggleFavorite(
    @Param("name") name: string,
    @Req() req: any
  ) {
    const correo = req.user?.email;
    await this.routeService.toggleRouteFavorite(correo, name);
    return { ok: true };
  }

}


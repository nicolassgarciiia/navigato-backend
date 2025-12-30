import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
} from "@nestjs/common";
import { RouteService } from "./application/route.service";
import { CalculateRouteDto } from "./dto/calculate-route.dto";
import { SaveRouteDto } from "./dto/save-route.dto";
import { RouteCostDto } from "./dto/route-cost.dto";

@Controller("routes")
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  // ======================================================
  // HU13 – Calcular ruta
  // ======================================================
  @Post("calculate")
  calculateRoute(@Body() dto: CalculateRouteDto, @Req() req: any) {
    const email = req.user?.email;
    return this.routeService.calculateRoute(
      email,
      dto.origen,
      dto.destino,
      dto.metodo
    );
  }

  // ======================================================
  // HU14 – Coste combustible
  // ======================================================
  @Post("cost/fuel")
  calculateFuelCost(@Body() dto: RouteCostDto, @Req() req: any) {
    const email = req.user?.email;
    return this.routeService.calculateRouteCostWithVehicle(
      email,
      dto.vehicleId
    );
  }

  // ======================================================
  // HU15 – Coste calorías
  // ======================================================
  @Post("cost/calories")
  calculateCalories(@Req() req: any) {
    const email = req.user?.email;
    return this.routeService.calculateRouteCalories(email);
  }

  // ======================================================
  // HU16 – Ruta por tipo
  // ======================================================
  @Post("calculate/type")
  calculateByType(@Body() dto: CalculateRouteDto, @Req() req: any) {
    const email = req.user?.email;
    return this.routeService.calculateRoute(
      email,
      dto.origen,
      dto.destino,
      dto.metodo
    );
  }

  // ======================================================
  // HU17 – Guardar ruta
  // ======================================================
  @Post("save")
  saveRoute(@Body() dto: SaveRouteDto, @Req() req: any) {
    const email = req.user?.email;
    return this.routeService.saveRoute(email, dto.name);
  }

  // ======================================================
  // HU18 – Listar rutas
  // ======================================================
  @Get()
  listRoutes(@Req() req: any) {
    const email = req.user?.email;
    return this.routeService.listSavedRoutes(email);
  }

  // ======================================================
  // HU19 – Eliminar ruta
  // ======================================================
  @Delete(":name")
  deleteRoute(@Param("name") name: string, @Req() req: any) {
    const email = req.user?.email;
    return this.routeService.deleteSavedRoute(email, name);
  }
}

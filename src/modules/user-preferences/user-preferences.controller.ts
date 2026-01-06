import {
  Controller,
  Put,
  Body,
  UseGuards,
  Get,
  Req,
  HttpCode,
} from "@nestjs/common";
import { UserPreferencesService } from "./application/user-preferences.service";
import { SupabaseAuthGuard } from "../../auth/supabase-auth.guard";

@UseGuards(SupabaseAuthGuard)
@Controller("user-preferences")
export class UserPreferencesController {
  constructor(
    private readonly userPreferencesService: UserPreferencesService
  ) {}

  // ==================================================
  // Obtener preferencias del usuario
  // ==================================================
  @Get()
  async getPreferences(@Req() req) {
    return this.userPreferencesService.getByUser(req.user.email);
  }

  // ==================================================
  // HU21 – Establecer vehículo por defecto
  // ==================================================
  @Put("default-vehicle")
  @HttpCode(204)
  async setDefaultVehicle(
    @Req() req,
    @Body("vehicleId") vehicleId: string
  ): Promise<void> {
    await this.userPreferencesService.setDefaultVehicle(
      req.user.email,
      vehicleId
    );
  }

  // ==================================================
  // HU22 – Establecer tipo de ruta por defecto
  // ==================================================
  @Put("default-route-type")
  @HttpCode(204)
  async setDefaultRouteType(
    @Req() req,
    @Body("routeType") routeType: string
  ): Promise<void> {
    await this.userPreferencesService.setDefaultRouteType(
      req.user.email,
      routeType
    );
  }
}

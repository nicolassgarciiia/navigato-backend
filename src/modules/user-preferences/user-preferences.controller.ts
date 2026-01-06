import {
  Controller,
  Put,
  Body,
  UseGuards,
  Get,
  Req
} from "@nestjs/common";
import { UserPreferencesService } from "./application/user-preferences.service";
import { SupabaseAuthGuard } from "src/auth/supabase-auth.guard";

@UseGuards(SupabaseAuthGuard)
@Controller("user-preferences")
export class UserPreferencesController {
  constructor(
    private readonly userPreferencesService: UserPreferencesService
  ) {}


  @UseGuards(SupabaseAuthGuard)
  @Get()
  async getPreferences(@Req() req) {
    return this.userPreferencesService.getByUser(req.user.email);
  }

  // ==================================================
  // HU21 – Establecer vehículo por defecto
  // ==================================================
  @Put("default-vehicle")
  async setDefaultVehicle(
    @Req() req,
    @Body("vehicleId") vehicleId: string
  ) {
    await this.userPreferencesService.setDefaultVehicle(
      req.user.email,
      vehicleId
    );
  }
    // ==================================================
  // HU22 – Establecer tipo de ruta por defecto
  // ==================================================
  @Put("default-route-type")
  async setDefaultRouteType(
    @Req() req,
    @Body("routeType") routeType: string
  ) {
    await this.userPreferencesService.setDefaultRouteType(
      req.user.email,
      routeType
    );
  }

}

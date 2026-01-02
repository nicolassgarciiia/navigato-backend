import {
  Controller,
  Put,
  Body,
} from "@nestjs/common";
import { UserPreferencesService } from "../../../src/modules/user-preferences/application/user-preferences.service";

@Controller("user-preferences")
export class UserPreferencesController {
  constructor(
    private readonly userPreferencesService: UserPreferencesService
  ) {}

  // ==================================================
  // HU21 – Establecer vehículo por defecto
  // ==================================================
  @Put("default-vehicle")
  async setDefaultVehicle(
    @Body("email") email: string,
    @Body("vehicleId") vehicleId: string
  ): Promise<void> {
    await this.userPreferencesService.setDefaultVehicle(
      email,
      vehicleId
    );
  }
    // ==================================================
  // HU22 – Establecer tipo de ruta por defecto
  // ==================================================
  @Put("default-route-type")
  async setDefaultRouteType(
    @Body("email") email: string,
    @Body("routeType") routeType: string
  ): Promise<void> {
    await this.userPreferencesService.setDefaultRouteType(
      email,
      routeType
    );
  }
}

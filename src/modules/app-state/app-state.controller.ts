import { Controller, Get, Query } from "@nestjs/common";
import { AppStateService } from "../../../src/modules/app-state/application/app-state.service";
import { ApplicationState } from "../../../src/modules/app-state/domain/app-state.entity";

@Controller("app-state")
export class AppStateController {
  constructor(
    private readonly appStateService: AppStateService
  ) {}

  // ==================================================
  // HU23 – Restaurar estado de la aplicación
  // ==================================================
  @Get("restore")
  async restoreApplicationState(
    @Query("email") email: string
  ): Promise<ApplicationState> {
    return this.appStateService.restoreApplicationState(email);
  }
}

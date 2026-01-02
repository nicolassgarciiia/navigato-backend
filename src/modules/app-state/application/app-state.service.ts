import { Injectable } from "@nestjs/common";
import { ApplicationState } from "../domain/app-state.entity";
import { PersistenceAccessError } from "../domain/errors";

import { UserRepository } from "../../user/domain/user.repository";
import { VehicleRepository } from "../../vehicle/domain/vehicle.repository";
import { POIRepository } from "../../poi/domain/poi.repository";
import { RouteRepository } from "../../route/domain/route.repository";
import { UserPreferencesRepository } from "../../user-preferences/domain/user-preferences.repository";
import { UserPreferences } from "../../user-preferences/domain/user-preferences.entity";

@Injectable()
export class AppStateService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly poiRepository: POIRepository,
    private readonly routeRepository: RouteRepository,
    private readonly preferencesRepository: UserPreferencesRepository
  ) {}

  async restoreApplicationState(
    userEmail: string
  ): Promise<ApplicationState> {
    try {
      const user = await this.userRepository.findByEmail(userEmail);
      if (!user) {
        throw new PersistenceAccessError();
      }

      const places = await this.poiRepository.findByUser(user.id);
      const vehicles = await this.vehicleRepository.findByUser(user.id);
      const savedRoutes = await this.routeRepository.findByUser(user.id);

      const preferences =
        (await this.preferencesRepository.findByUserId(user.id)) ??
        new UserPreferences({ userId: user.id });

      return new ApplicationState({
        user: {
          id: user.id,
          email: user.correo,
          nombre: user.nombre,
          apellidos: user.apellidos,
        },
        places,
        vehicles,
        savedRoutes,
        preferences,
      });
    } catch {
      throw new PersistenceAccessError();
    }
  }
}

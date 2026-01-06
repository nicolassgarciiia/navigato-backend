import { UserPreferences } from "./user-preferences.entity";

export abstract class UserPreferencesRepository {
  abstract findByUserId(
    userId: string
  ): Promise<UserPreferences | null>;

  abstract setDefaultVehicle(
    userId: string,
    vehicleId: string
  ): Promise<void>;

  abstract setDefaultRouteType(
    userId: string,
    routeType: string
  ): Promise<void>;

  abstract clearDefaultVehicle(userId: string): Promise<void>;

}

export abstract class UserPreferencesRepository {
  abstract findByUserId(userId: string): Promise<any | null>;

  abstract setDefaultVehicle(
    userId: string,
    vehicleId: string
  ): Promise<void>;
}

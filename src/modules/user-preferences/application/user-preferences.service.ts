import { Injectable } from "@nestjs/common";
import { UserPreferences } from "../domain/user-preferences.entity";

@Injectable()
export class UserPreferencesService {
  async setDefaultVehicle(
    userEmail: string,
    vehicleId: string
  ): Promise<void> {
    throw new Error("NotImplementedError");
  }

  async getByUser(userEmail: string): Promise<UserPreferences> {
    throw new Error("NotImplementedError");
  }
}

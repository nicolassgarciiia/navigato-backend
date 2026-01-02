import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { UserPreferencesRepository } from "../domain/user-preferences.repository";
import { UserPreferences } from "../domain/user-preferences.entity";

export class SupabaseUserPreferencesRepository
  implements UserPreferencesRepository
{
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );
  }

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await this.supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error("DatabaseConnectionError");
    }

    if (!data) return null;

    return new UserPreferences({
      userId: data.user_id,
      defaultVehicleId: data.default_vehicle_id,
      defaultRouteType: data.default_route_type,
    });
  }

  async setDefaultVehicle(
  userId: string,
  vehicleId: string
): Promise<void> {
  const { error } = await this.supabase
    .from("user_preferences")
    .upsert({
      user_id: userId,
      default_vehicle_id: vehicleId,
    });

  if (error) {
    throw error;
  }
}
async setDefaultRouteType(
  userId: string,
  routeType: string
): Promise<void> {
  const { error } = await this.supabase
    .from("user_preferences")
    .upsert({
      user_id: userId,
      default_route_type: routeType,
    });

  if (error) {
    throw error;
  }
}


}

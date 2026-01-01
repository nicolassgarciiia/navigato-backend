import { UserPreferences } from "./user-preferences.entity";

export abstract class UserPreferencesRepository {
  abstract findByUserId(userId: string): Promise<UserPreferences | null>;
  abstract save(preferences: UserPreferences): Promise<void>;
}

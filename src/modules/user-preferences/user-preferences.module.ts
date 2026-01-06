import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { VehicleModule } from "../vehicle/vehicle.module";

import { UserPreferencesService } from "./application/user-preferences.service";
import { UserPreferencesRepository } from "./domain/user-preferences.repository";
import { SupabaseUserPreferencesRepository } from "./infrastructure/supabase-user-preferences.repository";
import { UserPreferencesController } from "./user-preferences.controller";

@Module({
  imports: [
    UserModule,
    VehicleModule,
  ],
  controllers: [
    UserPreferencesController,
  ],
  providers: [
    UserPreferencesService,
    {
      provide: UserPreferencesRepository,
      useClass: SupabaseUserPreferencesRepository,
    },
  ],
  exports: [
    UserPreferencesService,
    UserPreferencesRepository,
  ],
})
export class UserPreferencesModule {}

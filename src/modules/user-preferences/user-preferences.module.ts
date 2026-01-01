import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { VehicleModule } from "../vehicle/vehicle.module";
import { UserPreferencesService } from "./application/user-preferences.service";
import { UserPreferencesRepository } from "./domain/user-preferences.repository";
import { SupabaseUserPreferencesRepository } from "./infrastructure/supabase-user-preferences.repository";

@Module({
  imports: [
    UserModule,      
    VehicleModule,   
  ],
  providers: [
    UserPreferencesService,
    {
      provide: UserPreferencesRepository,
      useClass: SupabaseUserPreferencesRepository,
    },
  ],
  exports: [UserPreferencesService],
})
export class UserPreferencesModule {}

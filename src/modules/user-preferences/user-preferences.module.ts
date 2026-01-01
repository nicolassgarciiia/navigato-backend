import { Module } from "@nestjs/common";
import { UserPreferencesService } from "./application/user-preferences.service";

@Module({
  providers: [UserPreferencesService],
  exports: [UserPreferencesService],
})
export class UserPreferencesModule {}

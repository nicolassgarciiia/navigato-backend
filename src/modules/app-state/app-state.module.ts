import { Module } from "@nestjs/common";
import { AppStateService } from "./application/app-state.service";

import { UserModule } from "../user/user.module";
import { VehicleModule } from "../vehicle/vehicle.module";
import { POIModule } from "../poi/poi.module";
import { RouteModule } from "../route/route.module";
import { UserPreferencesModule } from "../user-preferences/user-preferences.module";

@Module({
  imports: [
    UserModule,
    VehicleModule,
    POIModule,
    RouteModule,
    UserPreferencesModule,
  ],
  providers: [AppStateService],
  exports: [AppStateService],
})
export class AppStateModule {}

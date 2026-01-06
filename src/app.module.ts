import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./modules/user/user.module";
import { GeocodingModule } from "./modules/geocoding/geocoding.module";
import { POIModule } from "./modules/poi/poi.module"; 
import { VehicleModule } from "./modules/vehicle/vehicle.module";
import { RouteModule } from "./modules/route/route.module";
import { UserPreferencesModule } from "./modules/user-preferences/user-preferences.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === "test"
          ? ".env.test"
          : ".env",
    }),
    UserModule,
    GeocodingModule, 
    POIModule,
    VehicleModule,
    RouteModule,
    UserPreferencesModule       
  ],
})
export class AppModule {}
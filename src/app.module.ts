import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./modules/user/user.module";
import { GeocodingModule } from "./modules/geocoding/geocoding.module";
import { POIModule } from "./modules/poi/poi.module"; 
import { VehicleModule } from "./modules/vehicle/vehicle.module";

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
    VehicleModule       
  ],
})
export class AppModule {}
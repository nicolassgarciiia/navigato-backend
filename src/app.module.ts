import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./modules/user/user.module";
import { GeocodingModule } from "./modules/geocoding/geocoding.module";
import { POIModule } from "./modules/poi/poi.module"; 

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
  ],
})
export class AppModule {}
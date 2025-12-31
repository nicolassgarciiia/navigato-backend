import { Module } from "@nestjs/common";
import { POIController } from "./poi.controller";
import { POIService } from "./application/poi.service";
import { POIRepository } from "./domain/poi.repository";
import { SupabasePOIRepository } from "./infrastructure/supabase-poi.repository";
import { UserModule } from "../user/user.module";
import { GeocodingService } from "../geocoding/application/geocoding.service";
import { OpenRouteServiceGeocodingService } from "../geocoding/infrastructure/openrouteservice-geocoding.service";

@Module({
  imports: [
    UserModule, 
  ],
  controllers: [POIController],
  providers: [
    POIService,
    {
      provide: POIRepository,
      useClass: SupabasePOIRepository,
    },
    {
      provide: GeocodingService,
      useClass: OpenRouteServiceGeocodingService,
    },
  ],
  exports: [
    POIRepository, 
    POIService,
  ],
})
export class POIModule {}

import { Module } from "@nestjs/common";
import { POIController } from "./poi.controller";
import { POIService } from "./application/poi.service";
import { POIRepository } from "./domain/poi.repository";
import { SupabasePOIRepository } from "./infrastructure/supabase-poi.repository";
import { UserRepository } from "../user/domain/user.repository";
import { SupabaseUserRepository } from "../user/infrastructure/supabase-user.repository";
import { GeocodingService } from "../geocoding/application/geocoding.service";
import { OpenRouteServiceGeocodingService } from "../geocoding/infrastructure/openrouteservice-geocoding.service";

@Module({
  controllers: [POIController],
  providers: [
    POIService,
    {
      provide: POIRepository,
      useClass: SupabasePOIRepository,
    },
    {
      provide: UserRepository,
      useClass: SupabaseUserRepository,
    },
    {
      provide: GeocodingService,
      useClass: OpenRouteServiceGeocodingService,
    },
  ],
  exports: [POIRepository]
})
export class POIModule {}

import { Module } from '@nestjs/common';
import { GeocodingController } from './infrastructure/geocoding.controller';
import { GeocodingService } from './application/geocoding.service';
import { OpenRouteServiceGeocodingService } from './infrastructure/openrouteservice-geocoding.service';

@Module({
  controllers: [GeocodingController],
  providers: [
    {
      provide: GeocodingService,
      useClass: OpenRouteServiceGeocodingService,
    },
  ],
  exports: [GeocodingService],
})
export class GeocodingModule {}
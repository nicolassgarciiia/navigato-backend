import { Controller, Get, Query } from '@nestjs/common';
import { GeocodingService } from '../application/geocoding.service';

@Controller('geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Get('reverse')
  async reverseGeocoding(
    @Query('lat') lat: string, 
    @Query('lng') lng: string
  ) {
    // Llamamos al método del servicio
    const toponimo = await this.geocodingService.getToponimo(
      parseFloat(lat), 
      parseFloat(lng)
    );
    return { ok: true, toponimo };
  }
  @Get("search")
  async geocodingByToponym(
    @Query("q") q: string
  ) {
    if (!q || !q.trim()) {
      return {
        ok: false,
        error: "El topónimo es obligatorio",
      };
    }

    const { latitud, longitud } =
      await this.geocodingService.getCoordinatesFromToponym(q);

    return {
      ok: true,
      lat: latitud,
      lng: longitud,
    };
  }

}
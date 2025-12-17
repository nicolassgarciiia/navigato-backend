import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { GeocodingService } from '../application/geocoding.service';

@Controller('geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Get('reverse')
  async reverseGeocoding(
    @Query('lat') lat: string,
    @Query('lng') lng: string
  ) {
    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (!lat || !lng || isNaN(latNum) || isNaN(lngNum)) {
      throw new BadRequestException('Coordenadas inválidas');
    }

    const toponimo = await this.geocodingService.getToponimo(
      latNum,
      lngNum
    );

    return { ok: true, toponimo };
  }

  @Get('search')
  async geocodingByToponym(
    @Query('q') q: string
  ) {
    if (!q || !q.trim()) {
      throw new BadRequestException('El topónimo es obligatorio');
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

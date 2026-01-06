import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Delete,
  UseFilters,
  Req
} from "@nestjs/common";
import { POIService } from "./application/poi.service";
import { CreatePOIDto } from "./dto/create-poi.dto";
import { POIExceptionFilter } from "./poi-exception.filter";

@Controller("pois")
@UseFilters(POIExceptionFilter)
export class POIController {
  constructor(private readonly poiService: POIService) {}

  // =====================================================
  // HU05 – Alta de POI por coordenadas
  // =====================================================
  @Post()
  async create(@Body() body: CreatePOIDto) {
    return this.poiService.createPOI(
      body.correo,
      body.nombre,
      body.latitud,
      body.longitud
    );
  }

  // =====================================================
  // HU07 – Consulta de lista de lugares de interés
  // =====================================================
  @Get()
  async list(@Query("correo") correo: string) {
    return this.poiService.listByUser(correo);
  }

  // =====================================================
  // HU08 – Borrado de POI
  // =====================================================
  @Delete(":id")
  async deletePOI(
    @Param("id") id: string,
    @Query("correo") correo: string
  ) {
    await this.poiService.deletePOI(correo, id);
    return { ok: true };
  }

@Post(":id/favorite")
async toggleFavorite(@Param("id") id: string, @Body("correo") correo: string) {
  await this.poiService.togglePoiFavorite(correo, id);
  return { ok: true };
}







}

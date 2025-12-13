import { Controller, Post, Body } from "@nestjs/common";
import { POIService } from "./application/poi.service";

@Controller("pois")
export class POIController {
  constructor(private readonly poiService: POIService) {}

  @Post()
  async create(@Body() body: any) {
    return this.poiService.createPOI(
      body.correo,
      body.nombre,
      body.latitud,
      body.longitud
    );
  }
}

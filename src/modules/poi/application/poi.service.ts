import { Injectable, NotImplementedException } from "@nestjs/common";
import { POI } from "../domain/poi.entity";

@Injectable()
export class POIService {
  async createPOI(
    userEmail: string,
    nombre: string,
    latitud: number,
    longitud: number
  ): Promise<POI> {
    throw new NotImplementedException("createPOI not implemented yet");
  }
}

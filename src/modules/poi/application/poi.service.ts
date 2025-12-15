import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { POI } from "../domain/poi.entity";
import { POIRepository } from "../domain/poi.repository";
import { UserRepository } from "../../user/domain/user.repository";
import { GeocodingService } from "../../geocoding/application/geocoding.service";

import {
  InvalidPOINameError,
  DuplicatePOINameError,
  InvalidCoordinatesFormatError,
  AuthenticationRequiredError,
  GeocodingServiceUnavailableError,
  DatabaseConnectionError,
} from "../domain/errors";

@Injectable()
export class POIService {
  constructor(
    private readonly poiRepository: POIRepository,
    private readonly userRepository: UserRepository,
    private readonly geocodingService: GeocodingService
  ) {}

  async createPOI(
    userEmail: string,
    nombre: string,
    latitud: number,
    longitud: number
  ): Promise<POI> {
    // 1. Usuario autenticado
    const user = await this.userRepository.findByEmail(userEmail);
    if (!user) {
      throw new AuthenticationRequiredError();
    }

    // 2. Nombre válido
    if (!nombre || nombre.trim().length < 3) {
      throw new InvalidPOINameError();
    }

    // 3. Nombre no duplicado
    const duplicated = await this.poiRepository.findByUserAndName(
      user.id,
      nombre
    );
    if (duplicated) {
      throw new DuplicatePOINameError();
    }

    // 4. Coordenadas válidas
    if (
      latitud < -90 ||
      latitud > 90 ||
      longitud < -180 ||
      longitud > 180
    ) {
      throw new InvalidCoordinatesFormatError();
    }

    // 5. Geocoding
    let toponimo: string;
    try {
      toponimo = await this.geocodingService.getToponimo(latitud, longitud);
    } catch {
      throw new GeocodingServiceUnavailableError();
    }

    // 6. Crear entidad POI
    const poi = new POI({
      id: randomUUID(),
      nombre,
      latitud,
      longitud,
      toponimo,
      favorito: false,
    });

    // 7. Persistencia
    try {
      await this.poiRepository.save(poi, user.id);
    } catch {
      throw new DatabaseConnectionError();
    }

    return poi;
  }
  async createByToponym(email: string, nombre: string, toponimo: string): Promise<POI> {
    throw new Error("Method not implemented.");
}
}

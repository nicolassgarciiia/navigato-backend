import { Injectable } from "@nestjs/common";
import { POI } from "../domain/poi.entity";
import {
  InvalidCoordinatesFormatError,
  InvalidPOINameError,
  DuplicatePOINameError,
  AuthenticationRequiredError,
  GeocodingServiceUnavailableError,
  DatabaseConnectionError,
} from "../domain/errors";
import { POIRepository } from "../domain/poi.repository";
import { UserRepository } from "../../user/domain/user.repository";
import { GeocodingService } from "../../geocoding/geocoding.service";
import { randomUUID } from "crypto";

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
    // 1. Validación de usuario (E5)
    const user = await this.userRepository.findByEmail(userEmail);
    if (!user) throw new AuthenticationRequiredError();

    // 2. Validación de nombre (E4)
    if (!nombre || nombre.trim().length < 3) {
      throw new InvalidPOINameError();
    }

    // 3. Validación de duplicados
    const duplicated = await this.poiRepository.findByUserAndName(user.id, nombre);
    if (duplicated) throw new DuplicatePOINameError();

    // 4. Validación de rangos (E2, E3)
    if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
      throw new InvalidCoordinatesFormatError();
    }

    // 5. Geocoding Externo (E1 / E6)
    let toponimo: string;
    try {
      toponimo = await this.geocodingService.getToponimo(latitud, longitud);
    } catch {
      throw new GeocodingServiceUnavailableError();
    }

    // 6. Instanciación de la Entidad PURA (Sin userId)
    const poi = new POI({
      id: randomUUID(),
      nombre,
      latitud,
      longitud,
      toponimo,
      favorito: false,
    });

    // 7. Persistencia con Asociación
    try {
      // Pasamos el objeto y el ID por separado al repositorio
      await this.poiRepository.save(poi, user.id); 
    } catch {
      throw new DatabaseConnectionError();
    }

    return poi;
  }
}
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
  DatabaseConnectionError,
  PlaceOfInterestNotFoundError,
} from "../domain/errors";

@Injectable()
export class POIService {
  constructor(
    private readonly poiRepository: POIRepository,
    private readonly userRepository: UserRepository,
    private readonly geocodingService: GeocodingService
  ) {}

  // ======================================================
  // HU05 – Alta de POI por coordenadas
  // ======================================================
  async createPOI(
    userEmail: string,
    nombre: string,
    latitud: number,
    longitud: number
  ): Promise<POI> {
    const user = await this.getAuthenticatedUser(userEmail);

    this.validateName(nombre);
    await this.ensureNameNotDuplicated(user.id, nombre);

    this.validateCoordinates(latitud, longitud);

    const toponimo = await this.geocodingService.getToponimo(
      latitud,
      longitud
    );

    const poi = this.createPOIEntity({
      nombre,
      latitud,
      longitud,
      toponimo,
    });

    await this.savePOI(poi, user.id);

    return poi;
  }

  // ======================================================
  // HU06 – Alta de POI por topónimo
  // ======================================================
  async createByToponym(
    userEmail: string,
    nombre: string,
    toponimo: string
  ): Promise<POI> {
    const user = await this.getAuthenticatedUser(userEmail);

    this.validateName(nombre);
    await this.ensureNameNotDuplicated(user.id, nombre);

    const { latitud, longitud } =
      await this.geocodingService.getCoordinatesFromToponym(toponimo);

    const poi = this.createPOIEntity({
      nombre,
      latitud,
      longitud,
      toponimo,
    });

    await this.savePOI(poi, user.id);

    return poi;
  }

  // ======================================================
  // HU07 – Listado de POIs del usuario
  // ======================================================
  async listByUser(userEmail: string): Promise<POI[]> {
    const user = await this.getAuthenticatedUser(userEmail);

    try {
      return await this.poiRepository.findByUser(user.id);
    } catch {
      throw new DatabaseConnectionError();
    }
  }

  // ======================================================
  // HU08 – Borrado de POI
  // ======================================================
  async deletePOI(userEmail: string, poiId: string): Promise<void> {
    const user = await this.getAuthenticatedUser(userEmail);

    const poi = await this.poiRepository.findByIdAndUser(
      poiId,
      user.id
    );

    if (!poi) {
      throw new PlaceOfInterestNotFoundError();
    }

    try {
      await this.poiRepository.delete(poiId);
    } catch {
      throw new DatabaseConnectionError();
    }
  }
  async delete(poiId: string): Promise<void> {
  await this.poiRepository.delete(poiId);
  }
  async togglePoiFavorite(userEmail: string, poiId: string): Promise<void> {
  const user = await this.getAuthenticatedUser(userEmail);

  const poi = await this.poiRepository.findByIdAndUser(
    poiId,
    user.id
  );

  if (!poi) {
    throw new PlaceOfInterestNotFoundError();
  }

  poi.favorito = !poi.favorito;

  try {
    await this.poiRepository.update(poi);
  } catch {
    throw new DatabaseConnectionError();
  }
}




  // ======================================================
  // Helpers privados (reglas comunes)
  // ======================================================

  private async getAuthenticatedUser(userEmail: string) {
    const user = await this.userRepository.findByEmail(userEmail);
    if (!user) {
      throw new AuthenticationRequiredError();
    }
    return user;
  }

  private validateName(nombre: string) {
    if (!nombre || nombre.trim().length < 3) {
      throw new InvalidPOINameError();
    }
  }

  private validateCoordinates(latitud: number, longitud: number) {
    if (
      latitud < -90 ||
      latitud > 90 ||
      longitud < -180 ||
      longitud > 180
    ) {
      throw new InvalidCoordinatesFormatError();
    }
  }

  private async ensureNameNotDuplicated(userId: string, nombre: string) {
    const duplicated = await this.poiRepository.findByUserAndName(
      userId,
      nombre
    );
    if (duplicated) {
      throw new DuplicatePOINameError();
    }
  }

  private createPOIEntity(data: {
    nombre: string;
    latitud: number;
    longitud: number;
    toponimo: string;
  }): POI {
    return new POI({
      id: randomUUID(),
      favorito: false,
      ...data,
    });
  }

  private async savePOI(poi: POI, userId: string) {
    try {
      await this.poiRepository.save(poi, userId);
    } catch {
      throw new DatabaseConnectionError();
    }
  }
}

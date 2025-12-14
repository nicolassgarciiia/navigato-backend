import { POI } from "./poi.entity";

export abstract class POIRepository {
  abstract save(poi: POI, userId: string): Promise<void>;
  abstract findByUserAndName(
    userId: string,
    nombre: string
  ): Promise<POI | null>;
  abstract findByUser(userId: string): Promise<POI[]>;
}

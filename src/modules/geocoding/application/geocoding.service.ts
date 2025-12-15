export abstract class GeocodingService {
  abstract getToponimo(
    latitud: number,
    longitud: number
  ): Promise<string>;

  abstract getCoordinatesFromToponym(
    toponimo: string
  ): Promise<{
    latitud: number;
    longitud: number;
  }>;
}

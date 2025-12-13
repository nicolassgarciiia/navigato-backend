export abstract class GeocodingService {
  abstract getToponimo(latitud: number, longitud: number): Promise<string>;
}
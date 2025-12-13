export interface GeocodingService {
  getToponimo(latitud: number, longitud: number): Promise<string>;
}

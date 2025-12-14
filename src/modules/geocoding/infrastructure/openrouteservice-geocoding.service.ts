import { Injectable } from "@nestjs/common";
import { GeocodingService } from "../application/geocoding.service";

@Injectable()
export class OpenRouteServiceGeocodingService implements GeocodingService {
  private readonly apiKey = process.env.OPENROUTESERVICE_API_KEY;

  async getToponimo(latitud: number, longitud: number): Promise<string> {
    if (!this.apiKey) {
      throw new Error("GeocodingServiceUnavailable");
    }

    const url = `https://api.openrouteservice.org/geocode/reverse?api_key=${this.apiKey}&point.lat=${latitud}&point.lon=${longitud}`;

    let response: Response;

    try {
      response = await fetch(url);
    } catch {
      throw new Error("GeocodingServiceUnavailable");
    }

    if (!response.ok) {
      throw new Error("GeocodingServiceUnavailable");
    }

    const data: any = await response.json();

    if (!data?.features?.length) {
      throw new Error("GeocodingServiceUnavailable");
    }

    return data.features[0].properties.label;
  }
}

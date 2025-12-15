import { Injectable } from "@nestjs/common";
import { GeocodingService } from "../application/geocoding.service";
import {
  GeocodingToponymNotFoundError,
  GeocodingServiceUnavailableError,
} from "../../poi/domain/errors";

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
   async getCoordinatesFromToponym(
    toponimo: string
  ): Promise<{ latitud: number; longitud: number }> {
    if (!this.apiKey) {
      throw new GeocodingServiceUnavailableError();
    }

    const url =
      `https://api.openrouteservice.org/geocode/search?` +
      `api_key=${this.apiKey}&text=${encodeURIComponent(toponimo)}`;

    let response: Response;

    try {
      response = await fetch(url);
    } catch {
      throw new GeocodingServiceUnavailableError();
    }

    if (!response.ok) {
      throw new GeocodingServiceUnavailableError();
    }

    const data: any = await response.json();

    if (!data?.features || data.features.length === 0) {
      throw new GeocodingToponymNotFoundError();
    }

    // 🔑 La fuente de verdad de las coordenadas es el search
    const [lng, lat] = data.features[0].geometry.coordinates;

    return {
      latitud: lat,
      longitud: lng,
    };
  }
}

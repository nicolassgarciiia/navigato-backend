import { Injectable } from "@nestjs/common";
import { GeocodingService } from "../application/geocoding.service";
import {
  GeocodingServiceUnavailableError,
  GeocodingToponymNotFoundError,
} from "../domain/errors";

@Injectable()
export class OpenRouteServiceGeocodingService implements GeocodingService {
  private readonly apiKey = process.env.OPENROUTESERVICE_API_KEY;

  private async fetchJson(url: string): Promise<any> {
    let response: Response;

    try {
      response = await fetch(url);
    } catch {
      throw new GeocodingServiceUnavailableError();
    }

    if (!response.ok) {
      throw new GeocodingServiceUnavailableError();
    }

    return response.json();
  }

  async getToponimo(latitud: number, longitud: number): Promise<string> {
    if (!this.apiKey) {
      throw new GeocodingServiceUnavailableError();
    }

    const url =
      `https://api.openrouteservice.org/geocode/reverse?` +
      `api_key=${this.apiKey}&point.lat=${latitud}&point.lon=${longitud}`;

    const data = await this.fetchJson(url);

    if (!data?.features?.length) {
      throw new GeocodingToponymNotFoundError();
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

    const data = await this.fetchJson(url);

    if (!data?.features?.length) {
      throw new GeocodingToponymNotFoundError();
    }

    const [lng, lat] = data.features[0].geometry.coordinates;

    return {
      latitud: lat,
      longitud: lng,
    };
  }
}

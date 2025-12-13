import { Injectable } from "@nestjs/common";
import { GeocodingService } from "./geocoding.service";

@Injectable()
export class OpenRouteServiceGeocodingService
  implements GeocodingService
{
  private readonly apiKey = process.env.OPENROUTESERVICE_API_KEY;

  async getToponimo(latitud: number, longitud: number): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Missing OpenRouteService API key");
    }

    const url =
      `https://api.openrouteservice.org/geocode/reverse` +
      `?api_key=${this.apiKey}` +
      `&point.lat=${latitud}` +
      `&point.lon=${longitud}`;

    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error("ORS error:", response.status, text);
      throw new Error("OpenRouteServiceError");
    }

    const data: any = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error("NoGeocodingResult");
    }

    return data.features[0].properties.label;
  }
}

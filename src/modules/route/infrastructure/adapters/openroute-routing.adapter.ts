import { Injectable } from "@nestjs/common";
import { RoutingAdapter } from "./routing.adapter";
import { Route } from "../../domain/route.entity";

@Injectable()
export class OpenRouteRoutingAdapter implements RoutingAdapter {
  private readonly apiKey = process.env.OPENROUTESERVICE_API_KEY;
  private readonly baseUrl =
    "https://api.openrouteservice.org/v2/directions";

  async calculate(
    origen: { lat: number; lng: number },
    destino: { lat: number; lng: number },
    metodo: string,
    tipo: "rapida" | "corta" | "economica" = "rapida"
  ): Promise<Route> {
    if (!this.apiKey) {
      throw new Error("RoutingServiceUnavailableError");
    }

    const preferenceMap = {
      rapida: "fastest",
      corta: "shortest",
      economica: "recommended",
    };

    const preference = preferenceMap[tipo];


    const profile = this.mapMetodoToProfile(metodo);
    const url = `${this.baseUrl}/${profile}/geojson?preference=${preference}`;


    const body = {
      coordinates: [
        [origen.lng, origen.lat],
        [destino.lng, destino.lat],
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ORS error:", errorText);
      throw new Error("RoutingServiceUnavailableError");
    }

    const data = await response.json();

    if (
      !data ||
      !Array.isArray(data.features) ||
      data.features.length === 0
    ) {
      console.error("Invalid ORS response:", data);
      throw new Error("RoutingServiceUnavailableError");
    }

    const feature = data.features[0];
    const summary = feature.properties.summary;
    const geometry = feature.geometry.coordinates;

    return new Route({
      origen,
      destino,
      distancia: Math.round(summary.distance),
      duracion: Math.round(summary.duration),
      metodoMovilidad: metodo,
      coordenadas: geometry
    });
  }

  private mapMetodoToProfile(metodo: string): string {
    switch (metodo) {
      case "vehiculo":
        return "driving-car";
      case "pie":
        return "foot-walking";
      case "bici":
        return "cycling-regular";
      default:
        return "driving-car";
    }
  }
}

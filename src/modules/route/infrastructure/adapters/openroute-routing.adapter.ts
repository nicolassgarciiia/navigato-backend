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
  preference: "fastest" | "shortest" | "recommended" = "recommended"
): Promise<Route> {
  const profile = this.mapMetodoToProfile(metodo);
  const url = `${this.baseUrl}/${profile}/geojson`;

  const body = {
    coordinates: [
      [origen.lng, origen.lat],
      [destino.lng, destino.lat],
    ],
    preference,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: this.apiKey!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("ORS error:", err);
    throw new Error("RoutingServiceUnavailableError");
  }

  const data = await response.json();
  const feature = data.features[0];

  return new Route({
    origen,
    destino,
    distancia: Math.round(feature.properties.summary.distance),
    duracion: Math.round(feature.properties.summary.duration),
    metodoMovilidad: metodo,
    tipo: preference === "fastest"
      ? "rapida"
      : preference === "shortest"
      ? "corta"
      : "economica",
    coordenadas: feature.geometry.coordinates,
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

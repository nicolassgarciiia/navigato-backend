import { Route } from "../../domain/route.entity";
import { RoutingAdapter } from "./routing.adapter";

export class DummyRoutingAdapter implements RoutingAdapter {
  async calculate(origen: any, destino: any, metodo: string): Promise<Route> {
    return new Route({
      id: crypto.randomUUID(),
      origen,
      destino,
      metodoMovilidad: metodo,
      distancia: 9550,
      duracion: 730,
      tipo: "corta",
      coordenadas: [
        [origen.longitud, origen.latitud],
        [destino.longitud, destino.latitud],
      ],
    });
  }
}

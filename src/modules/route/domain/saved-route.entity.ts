import { Route } from "./route.entity";

export class SavedRoute {
  nombre: string;
  route: Route;
  favorito: boolean;
  fechaGuardado: Date;

  constructor(data: Partial<SavedRoute>) {
    Object.assign(this, data);
  }
}

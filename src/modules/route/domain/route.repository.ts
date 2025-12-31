import { SavedRoute } from "./saved-route.entity";

export abstract class RouteRepository {
  abstract save(
    userId: string,
    route: SavedRoute
  ): Promise<void>;

  abstract findByUser(
    userId: string
  ): Promise<SavedRoute[]>;

  abstract findByName(
    userId: string,
    name: string
  ): Promise<SavedRoute | null>;

  abstract delete(
    userId: string,
    name: string
  ): Promise<void>;
}

import { RouteRepository } from "../domain/route.repository";
import { SavedRoute } from "../domain/saved-route.entity";

export class InMemoryRouteRepository extends RouteRepository {
  private routes: Map<string, SavedRoute[]> = new Map();

  async save(userId: string, route: SavedRoute): Promise<void> {
    const list = this.routes.get(userId) ?? [];
    list.push(route);
    this.routes.set(userId, list);
  }

  async findByUser(userId: string): Promise<SavedRoute[]> {
    return this.routes.get(userId) ?? [];
  }

  async findByName(userId: string, name: string): Promise<SavedRoute | null> {
    const list = this.routes.get(userId);
    if (!list) return null;
    return list.find(r => r.nombre === name) ?? null;
  }

  async delete(userId: string, name: string): Promise<void> {
    const list = this.routes.get(userId);
    if (!list) return;
    this.routes.set(
      userId,
      list.filter(r => r.nombre !== name)
    );
  }
}

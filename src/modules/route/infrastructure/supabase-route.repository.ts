import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { RouteRepository } from "../domain/route.repository";
import { SavedRoute } from "../domain/saved-route.entity";

export class SupabaseRouteRepository implements RouteRepository {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );
  }

  async save(userId: string, route: SavedRoute): Promise<void> {
    const { error } = await this.supabase
      .from("saved_routes")
      .insert({
        user_id: userId,
        name: route.nombre,
        route: route.route,
        favorite: route.favorito,
      });

    if (error) {
      console.error("Supabase save route error:", error);
      throw new Error("DatabaseConnectionError");
    }
  }

  async findByUser(userId: string): Promise<SavedRoute[]> {
    const { data, error } = await this.supabase
      .from("saved_routes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase find routes error:", error);
      throw new Error("DatabaseConnectionError");
    }

    return (data ?? []).map(
      (row: any) =>
        new SavedRoute({
          nombre: row.name,
          route: row.route,
          favorito: row.favorite,
          fechaGuardado: row.created_at,
        })
    );
  }

  async findByName(
    userId: string,
    name: string
  ): Promise<SavedRoute | null> {
    const { data, error } = await this.supabase
      .from("saved_routes")
      .select("*")
      .eq("user_id", userId)
      .eq("name", name)
      .maybeSingle();

    if (error) {
      console.error("Supabase find route by name error:", error);
      throw new Error("DatabaseConnectionError");
    }

    if (!data) return null;

    return new SavedRoute({
      nombre: data.name,
      route: data.route,
      favorito: data.favorite,
      fechaGuardado: data.created_at,
    });
  }

  async delete(userId: string, name: string): Promise<void> {
    const { error } = await this.supabase
      .from("saved_routes")
      .delete()
      .eq("user_id", userId)
      .eq("name", name);

    if (error) {
      console.error("Supabase delete route error:", error);
      throw new Error("DatabaseConnectionError");
    }
  }
  async update(userId: string, route: SavedRoute): Promise<void> {
    const { error } = await this.supabase
      .from("saved_routes")
      .update({
        favorite: route.favorito,
        // Si necesitas actualizar el campo route en el futuro, se añadiría aquí
      })
      .eq("user_id", userId)
      .eq("name", route.nombre);

    if (error) {
      console.error("Supabase update route error:", error);
      throw new Error("DatabaseConnectionError");
    }
  }
}

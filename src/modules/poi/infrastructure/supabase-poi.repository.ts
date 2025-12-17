import { Injectable } from "@nestjs/common";
import { POIRepository } from "../domain/poi.repository";
import { POI } from "../domain/poi.entity";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabasePOIRepository implements POIRepository {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE! // IMPORTANTE: service role
    );
  }

  async save(poi: POI, userId: string): Promise<void> {
    const { error } = await this.supabase.from("pois").insert({
      id: poi.id,
      user_id: userId, // CLAVE
      nombre: poi.nombre,
      latitud: poi.latitud,
      longitud: poi.longitud,
      toponimo: poi.toponimo,
      favorito: poi.favorito,
    });

    if (error) {
      // Esto te dirá EXACTAMENTE qué falla en Supabase
      console.error("Supabase insert POI error:", error);
      throw error;
    }
  }

  async findByUserAndName(userId: string, nombre: string): Promise<POI | null> {
    const { data, error } = await this.supabase
      .from("pois")
      .select("*")
      .eq("user_id", userId)
      .eq("nombre", nombre)
      .maybeSingle();

    if (error) {
      console.error("Supabase findByUserAndName error:", error);
      throw error;
    }

    if (!data) return null;

    return new POI({
      id: data.id,
      nombre: data.nombre,
      latitud: Number(data.latitud),
      longitud: Number(data.longitud),
      toponimo: data.toponimo,
      favorito: data.favorito,
    });
  }

  async findByUser(userId: string): Promise<POI[]> {
    const { data, error } = await this.supabase
      .from("pois")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase findByUser error:", error);
      throw error;
    }

    return (data ?? []).map(
      (row: any) =>
        new POI({
          id: row.id,
          nombre: row.nombre,
          latitud: Number(row.latitud),
          longitud: Number(row.longitud),
          toponimo: row.toponimo,
          favorito: row.favorito,
        })
    );
  }
    // ======================================================
  // HU08 – Buscar POI por ID y usuario
  // ======================================================
  async findByIdAndUser(
    poiId: string,
    userId: string
  ): Promise<POI | null> {
    const { data, error } = await this.supabase
      .from("pois")
      .select("*")
      .eq("id", poiId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Supabase findByIdAndUser error:", error);
      throw error;
    }

    if (!data) return null;

    return new POI({
      id: data.id,
      nombre: data.nombre,
      latitud: Number(data.latitud),
      longitud: Number(data.longitud),
      toponimo: data.toponimo,
      favorito: data.favorito,
    });
  }

  // ======================================================
  // HU08 – Eliminar POI por ID
  // ======================================================
  async delete(poiId: string): Promise<void> {
    const { error } = await this.supabase
      .from("pois")
      .delete()
      .eq("id", poiId);

    if (error) {
      console.error("Supabase delete POI error:", error);
      throw error;
    }
  }

}

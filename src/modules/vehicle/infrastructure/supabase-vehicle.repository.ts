import { Injectable } from "@nestjs/common";
import { VehicleRepository } from "../domain/vehicle.repository";
import { Vehicle } from "../domain/vehicle.entity";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseVehicleRepository implements VehicleRepository {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );
  }

  // ======================================================
  // HU09 – Alta de vehículo
  // ======================================================
  async save(vehicle: Vehicle, userId: string): Promise<void> {
    const { error } = await this.supabase.from("vehicles").insert({
      id: vehicle.id,
      user_id: userId, // CLAVE
      nombre: vehicle.nombre,
      matricula: vehicle.matricula,
      tipo: vehicle.tipo,
      consumo: vehicle.consumo,
      favorito: vehicle.favorito,
    });

    if (error) {
      console.error("Supabase insert Vehicle error:", error);
      throw error;
    }
  }

  async findByUser(userId: string) {
    const { data, error } = await this.supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase findByUser vehicle error:", error);
      throw error;
    }

    return (data ?? []).map(
      (row: any) =>
        new Vehicle({
          id: row.id,
          nombre: row.nombre,
          matricula: row.matricula,
          tipo: row.tipo,
          consumo: Number(row.consumo),
          favorito: row.favorito,
        })
    );
  }

  async findByIdAndUser(
  vehicleId: string,
  userId: string
): Promise<Vehicle | null> {
  const { data, error } = await this.supabase
    .from("vehicles")
    .select("*")
    .eq("id", vehicleId)
    .eq("user_id", userId);

  if (!data || data.length === 0) {
    return null;
  }

  if (error) {
    throw new Error("DatabaseConnectionError");
  }

  const row = data[0];

  return new Vehicle({
    id: row.id,
    nombre: row.nombre,
    matricula: row.matricula,
    tipo: row.tipo,
    consumo: Number(row.consumo),
    favorito: row.favorito,
  });
}


  async delete(vehicleId: string): Promise<void> {
    const { error } = await this.supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicleId);

    if (error) {
      console.error("Supabase delete vehicle error:", error);
      throw error;
    }
  }

  async update(vehicle: Vehicle): Promise<void> {
  const { error } = await this.supabase
    .from("vehicles")
    .update({
      nombre: vehicle.nombre,
      matricula: vehicle.matricula,
      tipo: vehicle.tipo,
      consumo: vehicle.consumo,
      favorito: vehicle.favorito,
    })
    .eq("id", vehicle.id);

  if (error) {
    console.error("Supabase update Vehicle error:", error);
    throw error;
  }
}


}

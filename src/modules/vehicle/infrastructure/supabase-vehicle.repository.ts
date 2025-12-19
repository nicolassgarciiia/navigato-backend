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
      process.env.SUPABASE_SERVICE_ROLE! // IMPORTANTE: service role
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
}

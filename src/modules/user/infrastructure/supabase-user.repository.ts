import { Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/user.repository";
import { User } from "../domain/user.entity";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseUserRepository implements UserRepository {
  private supabase: SupabaseClient;
  
  // Definimos la tabla aquí para no equivocarnos al escribirla varias veces
  private readonly tableName = "usuarios"; 

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );
  }

  private mapToDomain(data: any): User {
    return new User({
      id: data.id,
      nombre: data.nombre,
      apellidos: data.apellidos,
      correo: data.correo,
      contrasenaHash: data.contrasenaHash,
    });
  }

  // ---------------------------------------------------------
  // Métodos Públicos
  // ---------------------------------------------------------

  async save(user: User): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .insert({
        id: user.id,
        nombre: user.nombre,
        apellidos: user.apellidos,
        correo: user.correo,
        contrasenaHash: user.contrasenaHash 
      });

    if (error) {
      throw new Error("DatabaseError: " + error.message);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("correo", email)
      .maybeSingle();

    if (error) throw new Error("DatabaseError: " + error.message);
    if (!data) return null;

    return this.mapToDomain(data);
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error("DatabaseError: " + error.message);
    if (!data) return null;

    return this.mapToDomain(data);
  }

  async deleteByEmail(email: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq("correo", email);

    if (error) throw new Error("DatabaseError: " + error.message);
  }
}
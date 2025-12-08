import { Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/user.repository";
import { User } from "../domain/user.entity";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseUserRepository implements UserRepository {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  async save(user: User): Promise<void> {
    const { error } = await this.supabase
      .from("usuarios")
      .insert({
        id: user.id,
        nombre: user.nombre,
        apellidos: user.apellidos,
        correo: user.correo,
        contraseña_hash: user.contraseña_hash,
        listaLugares: user.listaLugares,
        listaVehiculos: user.listaVehiculos,
        listaRutasGuardadas: user.listaRutasGuardadas,
        preferencias: user.preferencias
      });

    if (error) {
      throw new Error("DatabaseError: " + error.message);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("usuarios")
      .select("*")
      .eq("correo", email)
      .maybeSingle();

    if (error) {
      throw new Error("DatabaseError: " + error.message);
    }

    if (!data) return null;
    return new User(data);
  }

  async update(user: User): Promise<void> {
    await this.supabase
      .from("usuarios")
      .update({
        nombre: user.nombre,
        apellidos: user.apellidos,
        contraseña_hash: user.contraseña_hash,
        listaLugares: user.listaLugares,
        listaVehiculos: user.listaVehiculos,
        listaRutasGuardadas: user.listaRutasGuardadas,
        preferencias: user.preferencias
      })
      .eq("correo", user.correo);
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.supabase
      .from("usuarios")
      .delete()
      .eq("correo", email);
  }
}
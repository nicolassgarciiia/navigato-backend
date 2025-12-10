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
      process.env.SUPABASE_SERVICE_ROLE!
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
        contrasenaHash: user.contrasenaHash
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

    if (error) throw new Error("DatabaseError: " + error.message);
    if (!data) return null;

    return new User({
      id: data.id,
      nombre: data.nombre,
      apellidos: data.apellidos,
      correo: data.correo,
      contrasenaHash: data.contrasenaHash
    });
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error("DatabaseError: " + error.message);
    if (!data) return null;

    return new User({
      id: data.id,
      nombre: data.nombre,
      apellidos: data.apellidos,
      correo: data.correo,
      contrasenaHash: data.contrasenaHash
    });
  }

  async update(user: User): Promise<void> {
    const { error } = await this.supabase
      .from("usuarios")
      .update({
        nombre: user.nombre,
        apellidos: user.apellidos,
        password_hash: user.contrasenaHash
      })
      .eq("correo", user.correo);

    if (error) throw new Error("DatabaseError: " + error.message);
  }

  async deleteByEmail(email: string): Promise<void> {
    const { error } = await this.supabase
      .from("usuarios")
      .delete()
      .eq("correo", email);

    if (error) throw new Error("DatabaseError: " + error.message);
  }
}

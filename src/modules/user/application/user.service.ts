import { Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/user.repository";
import { User } from "../domain/user.entity";
import * as bcrypt from "bcryptjs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class UserService {
  private supabaseClient: SupabaseClient;   
  private supabaseAdmin: SupabaseClient;   

  constructor(private userRepository: UserRepository) {
    // Cliente para login / registro (anon key)
    this.supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    // Cliente administrador para borrar usuarios
    this.supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );
  }

  // ======================================================
  // HU01 – Registro
  // ======================================================
  async register(data: any): Promise<User> {
    if (!data.nombre || !data.apellidos || !data.correo)
      throw new Error("InvalidPersonalInformationError");

    if (!data.aceptaPoliticaPrivacidad)
      throw new Error("PrivacyPolicyNotAcceptedError");

    if (data.contraseña !== data.repetirContraseña)
      throw new Error("PasswordsDoNotMatchError");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.correo))
      throw new Error("InvalidEmailFormatError");

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,16}$/;

    if (!passwordRegex.test(data.contraseña))
      throw new Error("InvalidPasswordError");

    const existed = await this.userRepository.findByEmail(data.correo);
    if (existed) throw new Error("EmailAlreadyRegisteredError");

    // Registro en Supabase Auth (anon key)
    const { data: authData, error: authError } =
      await this.supabaseClient.auth.signUp({
        email: data.correo,
        password: data.contraseña,
        options: {
          data: {
            nombre: data.nombre,
            apellidos: data.apellidos,
          },
        },
      });

    if (authError) {
      // Caso: email ya existe en supabase auth
      if (authError.message.toLowerCase().includes("exists")) {
        throw new Error("EmailAlreadyRegisteredError");
      }
      throw new Error("AuthRegisterError");
    }

    if (!authData.user) throw new Error("AuthRegisterError");

    const hash = await bcrypt.hash(data.contraseña, 10);

    const user = new User({
      id: authData.user.id,
      nombre: data.nombre,
      apellidos: data.apellidos,
      correo: data.correo,
      contrasenaHash: hash,
    });

    await this.userRepository.save(user);
    return user;
  }

  // ======================================================
  // HU02 – Inicio de sesión
  // ======================================================
  async login(correo: string, contraseña: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo))
      throw new Error("InvalidEmailFormatError");

    if (!contraseña || contraseña.trim() === "")
      throw new Error("InvalidCredentialsError");

    const user = await this.userRepository.findByEmail(correo);
    if (!user) throw new Error("UserNotFoundError");

    const { data, error } =
      await this.supabaseClient.auth.signInWithPassword({
        email: correo,
        password: contraseña,
      });

    if (error) {
      // 1. SI LA CONTRASEÑA ESTÁ MAL
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("InvalidCredentialsError");
      }
      
      // 2. SI EL EMAIL NO ESTÁ CONFIRMADO (NUEVO)
      if (error.message.includes("Email not confirmed")) {
        throw new Error("EmailNotConfirmedError");
      }
      // 3. CUALQUIER OTRO ERROR
      throw new Error("AuthLoginError");
    }

    return {
      user,
      access_token: data.session.access_token,
    };
  }

  // ======================================================
  // HU03 – Logout (idempotente)
  // ======================================================
  async logout(correo: string): Promise<void> {
    const user = await this.userRepository.findByEmail(correo);
    if (!user) throw new Error("UserNotFoundError");

    // Logout es responsabilidad del frontend eliminando el token.
    return;
  }

  // ======================================================
  // HU04 – Eliminar cuenta de usuario
  // ======================================================
  async deleteAccount(correo: string): Promise<User> {
    const user = await this.userRepository.findByEmail(correo);
    if (!user) throw new Error("UserNotFoundError");

    // Borrar en Supabase Auth
    const { error } = await this.supabaseAdmin.auth.admin.deleteUser(user.id);
    if (error) console.error(error.message);

    // Borrar en BD local
    await this.userRepository.deleteByEmail(correo);

    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  // ======================================================
  // Eliminación robusta e idempotente para HU01
  // ======================================================
  async deleteByEmail(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    // 1. Si existe en BD local → borrar en auth
    if (user) {
      try {
        await this.supabaseAdmin.auth.admin.deleteUser(user.id);
      } catch (err) {
        console.warn("Failed to delete user in Supabase Auth:", err);
      }
    }

    // 2. Aunque no exista localmente, buscarlo en Supabase Auth por email
    if (!user) {
      const { data, error } = await this.supabaseAdmin.auth.admin.listUsers();

      if (!error) {
        const found = data.users.find((u) => u.email === email);
        if (found) {
          try {
            await this.supabaseAdmin.auth.admin.deleteUser(found.id);
          } catch (err) {
            console.error("Error deleting orphan auth user:", err);
          }
        }
      }
    }

    // 3. Borrar SIEMPRE en la BD local
    await this.userRepository.deleteByEmail(email);
  }
}

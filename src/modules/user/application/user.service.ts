import { Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/user.repository";
import { User } from "../domain/user.entity";
import * as bcrypt from "bcryptjs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { RegisterUserDto } from "../dto/create-user.dto";


@Injectable()
export class UserService {
  private supabaseClient: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private userRepository: UserRepository) {
    this.supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    this.supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );
  }

  // ======================================================
  // HU01 – Registro
  // ======================================================
  async register(data: RegisterUserDto): Promise<User> {
    
    this.validateRegistrationData(data);

   
    const existed = await this.userRepository.findByEmail(data.correo);
    if (existed) throw new Error("EmailAlreadyRegisteredError");

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
      if (authError.message.toLowerCase().includes("exists")) {
        throw new Error("EmailAlreadyRegisteredError");
      }
      throw new Error("AuthRegisterError");
    }

    if (!authData.user) throw new Error("AuthRegisterError");

    try {
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

    } catch (dbError) {
      console.error("Error guardando en BD local. Realizando Rollback en Supabase...", dbError);
      await this.supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error("DatabaseSaveError"); 
    }
  }

  // ======================================================
  // HU02 – Inicio de sesión
  // ======================================================
  async login(correo: string, contraseña: string) {
    if (!this.isValidEmail(correo)) throw new Error("InvalidEmailFormatError");
    if (!contraseña || contraseña.trim() === "") throw new Error("InvalidCredentialsError");

    const user = await this.userRepository.findByEmail(correo);
    if (!user) throw new Error("UserNotFoundError");

    const { data, error } =
      await this.supabaseClient.auth.signInWithPassword({
        email: correo,
        password: contraseña,
      });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("InvalidCredentialsError");
      }
      if (error.message.includes("Email not confirmed")) {
        throw new Error("EmailNotConfirmedError");
      }
      throw new Error("AuthLoginError");
    }

    return {
      user,
      access_token: data.session.access_token,
    };
  }

  // ======================================================
  // HU03 – Logout
  // ======================================================
  async logout(correo: string): Promise<void> {
    const user = await this.userRepository.findByEmail(correo);
    if (!user) throw new Error("UserNotFoundError");

    return;
  }

  // ======================================================
  // HU04 – Eliminar cuenta
  // ======================================================
  async deleteAccount(correo: string): Promise<User> {
    const user = await this.userRepository.findByEmail(correo);
    if (!user) throw new Error("UserNotFoundError");

    const { error } = await this.supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (error) {
       console.error("Error borrando en Supabase:", error.message);
       throw new Error("AuthDeleteError");
    }

    await this.userRepository.deleteByEmail(correo);

    return user;
  }

  
  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  private validateRegistrationData(data: RegisterUserDto) {
    if (!data.nombre || !data.apellidos || !data.correo)
      throw new Error("InvalidPersonalInformationError");

    if (!data.aceptaPoliticaPrivacidad)
      throw new Error("PrivacyPolicyNotAcceptedError");

    if (data.contraseña !== data.repetirContraseña)
      throw new Error("PasswordsDoNotMatchError");

    if (!this.isValidEmail(data.correo))
      throw new Error("InvalidEmailFormatError");

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,16}$/;
    if (!passwordRegex.test(data.contraseña))
      throw new Error("InvalidPasswordError");
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }


  async deleteByEmail(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (user) {
      try {
        await this.supabaseAdmin.auth.admin.deleteUser(user.id);
      } catch (err) {
      }
    }

    const { data, error } = await this.supabaseAdmin.auth.admin.listUsers();
    if (!error) {
      const found = data.users.find((u) => u.email === email);
      if (found) {
        try {
          await this.supabaseAdmin.auth.admin.deleteUser(found.id);
        } catch (err) {}
      }
    }

    await this.userRepository.deleteByEmail(email);
  }
}
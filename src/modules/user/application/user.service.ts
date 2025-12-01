import { Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/user.repository";
import { randomUUID } from "crypto";
import { User } from "../domain/user.entity";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

async register(data: any): Promise<User> {

  if (!data.nombre || !data.apellidos || !data.correo) {
    throw new Error("InvalidPersonalInformationError");
  }

  if (!data.aceptaPoliticaPrivacidad) {
    throw new Error("PrivacyPolicyNotAcceptedError");
  }

  if (data.contraseña !== data.repetirContraseña) {
    throw new Error("PasswordsDoNotMatchError");
  }

  const existed = await this.userRepository.findByEmail(data.correo);
  if (existed) {
    throw new Error("EmailAlreadyRegisteredError");
  }
  // Validación de contraseña (HU01_E05)
  const password = data.contraseña;

  const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,16}$/;

  if (!passwordRegex.test(password)) {
  throw new Error("InvalidPasswordError");
  }
    const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(data.correo)) {
    throw new Error("InvalidEmailFormatError");
  }

  const id = randomUUID();
  const contraseña_hash = await bcrypt.hash(data.contraseña, 10);

  const user = new User({
    id,
    nombre: data.nombre,
    apellidos: data.apellidos,
    correo: data.correo,
    contraseña_hash,
    sesion_activa: true,
    listaLugares: [],
    listaVehiculos: [],
    listaRutasGuardadas: [],
    preferencias: {}
  });

  await this.userRepository.save(user);

  const saved = await this.userRepository.findByEmail(user.correo);
  return saved!;
}
  async deleteByEmail(email: string): Promise<void> {
  return this.userRepository.deleteByEmail(email);
}

}

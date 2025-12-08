import { Test } from "@nestjs/testing";
import { UserModule } from "../../src/modules/user/user.module";
import { UserService } from "../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import * as crypto from "crypto";
dotenv.config();

describe("HU02 – Inicio de sesión (ATDD)", () => {
  let service: UserService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    service = moduleRef.get(UserService);
  });

  // =======================================================
  // HU02_E01 – Inicio de sesión correcto
  // =======================================================
  test("HU02_E01 – Credenciales correctas → inicio correcto", async () => {
    const email = `hu02e01@test.com`;

    // Crear usuario
    await service.register({
      nombre: "Prueba",
      apellidos: "Test",
      correo: email,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });

    const result = await service.login(email, "ValidPass1!");

    expect(result).toBeDefined();
    expect(result.correo).toBe(email);

    await service.deleteByEmail(email);
  });

  // =======================================================
  // HU02_E02 – Email no existe en el sistema
  // =======================================================
  test("HU02_E02 – Email inexistente → error", async () => {
    const email = `hu02e02@test.com`;

    await expect(service.login(email, "ValidPass1!"))
      .rejects.toThrow("UserNotFoundError");
  });

  // =======================================================
  // HU02_E03 – Contraseña incorrecta
  // =======================================================
  test("HU02_E03 – Contraseña incorrecta → error", async () => {
    const email = `hu02e03@test.com`;

    await service.register({
      nombre: "Prueba",
      apellidos: "Test",
      correo: email,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });

    await expect(service.login(email, "Incorrecta1!"))
      .rejects.toThrow("InvalidCredentialsError");

    await service.deleteByEmail(email);
  });

  // =======================================================
  // HU02_E04 – Email con formato no válido
  // =======================================================
  test("HU02_E04 – Formato de email inválido", async () => {
    await expect(
      service.login("email-malo", "ValidPass1!")
    ).rejects.toThrow("InvalidEmailFormatError");
  });

  // =======================================================
  // HU02_E05 – Contraseña vacía o no válida
  // =======================================================
  test("HU02_E05 – Contraseña vacía → error", async () => {
    const email = `hu02e05_${crypto.randomUUID()}@test.com`;

    await expect(service.login(email, ""))
      .rejects.toThrow("InvalidCredentialsError");
  });


});

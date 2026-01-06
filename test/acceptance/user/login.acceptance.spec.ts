import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";

dotenv.config();

describe("HU02 – Inicio de sesión (ATDD)", () => {
  let service: UserService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    service = moduleRef.get(UserService);

    // 🔐 Asegurar usuario de test (solo si no existe)
    const existing = await service.findByEmail(TEST_EMAIL);

    if (!existing) {
      await service.register({
        nombre: "Usuario",
        apellidos: "Test ATDD",
        correo: TEST_EMAIL,
        contraseña: TEST_PASSWORD,
        repetirContraseña: TEST_PASSWORD,
        aceptaPoliticaPrivacidad: true,
      });
    }
  });

  // =======================================================
  // HU02_E01 – Inicio de sesión correcto
  // =======================================================
  test("HU02_E01 – Credenciales correctas → inicio correcto", async () => {
    const result = await service.login(TEST_EMAIL, TEST_PASSWORD);

    expect(result).toBeDefined();
    expect(result.user.correo).toBe(TEST_EMAIL);
    expect(result.access_token).toBeDefined();
    expect(typeof result.access_token).toBe("string");
  });

  // =======================================================
  // HU02_E02 – Email no existe en el sistema
  // =======================================================
  test("HU02_E02 – Email inexistente → error", async () => {
    await expect(
      service.login("no-existe@atdd.com", TEST_PASSWORD)
    ).rejects.toThrow("UserNotFoundError");
  });

  // =======================================================
  // HU02_E03 – Contraseña incorrecta
  // =======================================================
  test("HU02_E03 – Contraseña incorrecta → error", async () => {
    await expect(
      service.login(TEST_EMAIL, "Incorrecta1!")
    ).rejects.toThrow("InvalidCredentialsError");
  });

  // =======================================================
  // HU02_E04 – Email con formato no válido
  // =======================================================
  test("HU02_E04 – Formato de email inválido", async () => {
    await expect(
      service.login("email-malo-sin-arroba", TEST_PASSWORD)
    ).rejects.toThrow("InvalidEmailFormatError");
  });

  // =======================================================
  // HU02_E05 – Contraseña vacía
  // =======================================================
  test("HU02_E05 – Contraseña vacía → error", async () => {
    await expect(
      service.login(TEST_EMAIL, "")
    ).rejects.toThrow("InvalidCredentialsError");
  });
});

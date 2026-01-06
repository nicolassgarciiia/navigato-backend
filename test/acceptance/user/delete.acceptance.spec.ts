import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";

dotenv.config();

describe("HU04 – Eliminar cuenta de usuario (ATDD)", () => {
  let service: UserService;

  let emailsToDelete: string[] = [];

  const PASSWORD = "ValidPass1!";

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    service = moduleRef.get(UserService);
  });

  // ======================================================
  // Limpieza defensiva (por si algún test falla antes)
  // ======================================================
  afterEach(async () => {
    for (const email of emailsToDelete) {
      try {
        await service.deleteByEmail(email);
      } catch {
        // limpieza best-effort
      }
    }
    emailsToDelete = [];
  });

  // ======================================================
  // HU04_E01 – Eliminación exitosa de la cuenta
  // ======================================================
  test("HU04_E01 – Eliminación exitosa de la cuenta", async () => {
    const email = `hu04-e01-${randomUUID()}@test.com`;
    emailsToDelete.push(email);

    // ARRANGE → crear usuario
    await service.register({
      nombre: "Activo",
      apellidos: "García Edo",
      correo: email,
      contraseña: PASSWORD,
      repetirContraseña: PASSWORD,
      aceptaPoliticaPrivacidad: true,
    });

    // ACT → eliminar cuenta
    const result = await service.deleteAccount(email);

    // ASSERT
    expect(result).toBeDefined();
    expect(result.correo).toBe(email);

    const deleted = await service.findByEmail(email);
    expect(deleted).toBeNull();

    // ya no hay nada que limpiar
    emailsToDelete = [];
  });

  // ======================================================
  // HU04_E02 – Intento de borrado sin usuario
  // ======================================================
  test("HU04_E02 – Usuario no existe → error", async () => {
    const email = `hu04-no-existe-${randomUUID()}@test.com`;

    await expect(
      service.deleteAccount(email)
    ).rejects.toThrow("UserNotFoundError");
  });
});

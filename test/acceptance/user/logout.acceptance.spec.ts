import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";

dotenv.config();

describe("HU03 – Cerrar sesión (ACCEPTANCE)", () => {
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

  // ======================================================
  // HU03_E01 – Cierre de sesión exitoso
  // ======================================================
  test("HU03_E01 – Cierre de sesión exitoso", async () => {
    await expect(service.logout(TEST_EMAIL)).resolves.not.toThrow();
  });

  // ======================================================
  // HU03_E02 – Cierre de sesión repetido (idempotencia lógica)
  // ======================================================
  test("HU03_E02 – Cierre de sesión repetida", async () => {
    await service.logout(TEST_EMAIL);

    await expect(service.logout(TEST_EMAIL)).resolves.not.toThrow();
  });
});

import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
dotenv.config();

describe("HU03 – Cerrar sesión (ATDD)", () => {
  let service: UserService;
  
  let emailsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    service = moduleRef.get(UserService);
  });

  // ==========================================================
  // 2. AFTER EACH: Limpieza automática
  // ==========================================================
  afterEach(async () => {
    for (const email of emailsToDelete) {
      try {
        await service.deleteByEmail(email);
      } catch (error) {
      }
    }
    emailsToDelete = [];
  });

  // ======================================================
  // HU03_E01 – Cierre de sesión exitoso
  // ======================================================
  test("HU03_E01 – Cierre de sesión exitoso", async () => {
    // Email dinámico
    const email = `hu03_${crypto.randomUUID()}@test.com`;
    emailsToDelete.push(email); 

    await service.register({
      nombre: "Usuario",
      apellidos: "Activo",
      correo: email,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });

    await expect(service.logout(email)).resolves.not.toThrow();

  });

  // ======================================================
  // HU03_E02 – Idempotencia (Cerrar sesión si no existe)
  // ======================================================
  test("HU03_E02 – Cerrar sesión repetida (Idempotencia)", async () => {
    const email = `hu03e02_${Date.now()}@test.com`;
    emailsToDelete.push(email); // Agendar borrado

    // 1. Precondición
    await service.register({
      nombre: "Usuario",
      apellidos: "Inactivo",
      correo: email,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });

    // 2. Primer logout
    await service.logout(email);

    // 3. Segundo logout
    await expect(service.logout(email)).resolves.not.toThrow();
  });

});
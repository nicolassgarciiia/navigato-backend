import { Test } from "@nestjs/testing";
import { UserModule } from "../../src/modules/user/user.module";
import { UserService } from "../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import * as crypto from "crypto";
dotenv.config();

describe("HU03 – Cerrar sesión (ATDD)", () => {
  let service: UserService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    service = moduleRef.get(UserService);
  });

  // ======================================================
  // HU03_E01 – Cierre de sesión exitoso
  // ======================================================
  test("HU03_E01 – Cierre de sesión exitoso", async () => {
    const email = `hu03e01@test.com`;

    // 1. Registramos (Supabase inicia sesión automáticamente)
    await service.register({
      nombre: "Usuario",
      apellidos: "Activo",
      correo: email,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });

    // 2. Ejecutamos Logout
    // Esperamos que se resuelva sin errores (void)
    await expect(service.logout(email)).resolves.not.toThrow();

    // Limpieza
    await service.deleteByEmail(email);
  });

  // ======================================================
  // HU03_E02 – Idempotencia (Cerrar sesión si no existe)
  // ======================================================
  test("HU03_E02 – Cerrar sesión repetida (Idempotencia)", async () => {
    const email = `hu03e02@test.com`;

    await service.register({
      nombre: "Usuario",
      apellidos: "Inactivo",
      correo: email,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });

    // Primer logout (Válido)
    await service.logout(email);

    // Segundo logout (Válido - No debe dar error "NoUserAuthenticated")
    // En sistemas modernos, asegurar que estás fuera es una operación segura.
    await expect(service.logout(email)).resolves.not.toThrow();

    await service.deleteByEmail(email);
  });


});

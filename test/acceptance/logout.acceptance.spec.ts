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

    // Registrar usuario → queda con sesion_activa = true (HU01)
    await service.register({
      nombre: "Usuario",
      apellidos: "Activo",
      correo: email,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });

    // Logout
    const result = await service.logout(email);

    expect(result).toBeDefined();
    expect(result.sesion_activa).toBe(false);

    await service.deleteByEmail(email);
  });

  // ======================================================
  // HU03_E02 – No existe sesión activa
  // ======================================================
  test("HU03_E02 – No hay sesión activa → error", async () => {
    const email = `hu03e02@test.com`;

    await service.register({
      nombre: "Usuario",
      apellidos: "Inactivo",
      correo: email,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });

    await service.forceLogout(email);

    await expect(service.logout(email))
      .rejects.toThrow("NoUserAuthenticatedError");

    await service.deleteByEmail(email);
  });


});

import { Test } from "@nestjs/testing";
import { UserModule } from "../../src/modules/user/user.module";
import { UserService } from "../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import * as crypto from "crypto";
dotenv.config();

describe("HU04 – Eliminar cuenta de usuario (ATDD)", () => {
  let service: UserService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    service = moduleRef.get(UserService);
  });

  // ======================================================
  // HU04_E01 – Eliminación exitosa de la cuenta
  // ======================================================
  test("HU04_E01 – Eliminación exitosa de la cuenta", async () => {
    const email = `hu04e01@test.com`;

    // Crear usuario con datos asociados
    await service.register({
      nombre: "Activo",
      apellidos: "García Edo",
      correo: email,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });

    // Aseguramos logout inicial
    await service.forceLogout(email);

    // Iniciar sesión para tener sesion_activa = true
    await service.login(email, "ValidPass1!");

    // Ejecutar eliminación
    const result = await service.deleteAccount(email);

    expect(result).toBeDefined();
    expect(result.correo).toBe(email);
    expect(result.sesion_activa).toBe(false);

    // Comprobar que el usuario ya no está en la BD
    const deleted = await service.findByEmail(email);
    expect(deleted).toBeNull();
  });

  // ======================================================
  // HU04_E02 – Usuario NO autenticado intenta eliminar su cuenta
  // ======================================================
  test("HU04_E02 – Usuario no autenticado → error", async () => {
    const email = `hu04e02@test.com`;

    await service.register({
      nombre: "Inactivo",
      apellidos: "García Edo",
      correo: email,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });

    await service.forceLogout(email); // Para asegurar sesion_activa = false

    await expect(service.deleteAccount(email))
      .rejects.toThrow("AuthenticationRequiredError");

    // Comprobar que el usuario NO se borró
    const stillExists = await service.findByEmail(email);
    expect(stillExists).not.toBeNull();

    await service.deleteByEmail(email); 
  });

});

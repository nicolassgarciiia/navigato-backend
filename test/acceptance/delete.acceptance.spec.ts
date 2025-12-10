import { Test } from "@nestjs/testing";
import { UserModule } from "../../src/modules/user/user.module";
import { UserService } from "../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";

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

    // 1. Crear usuario
    await service.register({
      nombre: "Activo",
      apellidos: "García Edo",
      correo: email,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });

    // 2. Ejecutar eliminación
    const result = await service.deleteAccount(email);

    expect(result).toBeDefined();
    expect(result.correo).toBe(email);

    // 💡 YA NO COMPROBAMOS sesion_activa

    // 3. Comprobar que el usuario ya no está en la BD
    const deleted = await service.findByEmail(email);
    expect(deleted).toBeNull();
  });

  // ======================================================
  // HU04_E02 – Intento de borrado sin usuario
  // ======================================================
  test("HU04_E02 – Usuario no existe o error de lógica", async () => {
     const email = "no-existe@test.com";
     
     await expect(service.deleteAccount(email))
       .rejects.toThrow("UserNotFoundError");
  });

});

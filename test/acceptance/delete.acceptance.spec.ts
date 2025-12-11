import { Test } from "@nestjs/testing";
import { UserModule } from "../../src/modules/user/user.module";
import { UserService } from "../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU04 – Eliminar cuenta de usuario (ATDD)", () => {
  let service: UserService;
  
  // 1. LISTA DE LIMPIEZA
  let emailsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    service = moduleRef.get(UserService);
  });

  // ==========================================================
  // 2. AFTER EACH
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
  // HU04_E01 – Eliminación exitosa de la cuenta
  // ======================================================
  test("HU04_E01 – Eliminación exitosa de la cuenta", async () => {
    // Email dinámico
    const email = `hu04e01@test.com`;
    emailsToDelete.push(email);

    // 1. Crear usuario (Precondición)
    await service.register({
      nombre: "Activo",
      apellidos: "García Edo",
      correo: email,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });

    // 2. Ejecutar eliminación (Acción)
    const result = await service.deleteAccount(email);

    // 3. Validaciones
    expect(result).toBeDefined();
    if (result && result.correo) {
        expect(result.correo).toBe(email);
    }

    // 4. Comprobación final: El usuario ya no debe existir
    const deleted = await service.findByEmail(email);
    expect(deleted).toBeNull();
  });

  // ======================================================
  // HU04_E02 – Intento de borrado sin usuario
  // ======================================================
  test("HU04_E02 – Usuario no existe o error de lógica", async () => {
     const email = `no-existe@test.com`;
     

     await expect(service.deleteAccount(email))
       .rejects.toThrow("UserNotFoundError");
  });

});
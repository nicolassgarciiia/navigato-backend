import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU02 – Inicio de sesión (ATDD)", () => {
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
  // 2. AFTER EACH: Limpieza automática
  // ==========================================================
  afterEach(async () => {
    for (const email of emailsToDelete) {
      try {
        await service.deleteByEmail(email);
      } catch (error) {
        // Ignoramos si no existe
      }
    }
    emailsToDelete = [];
  });

  // =======================================================
  // HU02_E01 – Inicio de sesión correcto
  // =======================================================
  test("HU02_E01 – Credenciales correctas → inicio correcto", async () => {
    // Email dinámico para evitar colisiones
    const email = `hu02_${crypto.randomUUID()}@test.com`;
    emailsToDelete.push(email); // Agendar borrado

    // Precondición: Crear usuario
    await service.register({
      nombre: "Prueba",
      apellidos: "Test",
      correo: email,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });
    
    // Acción: Login
    const result = await service.login(email, "ValidPass1!");

    // Verificaciones
    expect(result).toBeDefined();
    expect(result.user.correo).toBe(email);
    expect(result.access_token).toBeDefined();
    expect(typeof result.access_token).toBe("string");
    
  });

  // =======================================================
  // HU02_E02 – Email no existe en el sistema
  // =======================================================
  test("HU02_E02 – Email inexistente → error", async () => {

    const email = `hu02e02_inexistente@test.com`;
    

    await expect(service.login(email, "ValidPass1!"))
      .rejects.toThrow("UserNotFoundError");
  });

  // =======================================================
  // HU02_E03 – Contraseña incorrecta
  // =======================================================
  test("HU02_E03 – Contraseña incorrecta → error", async () => {
    const email = `hu02e03@test.com`;
    emailsToDelete.push(email); 

    await service.register({
      nombre: "Prueba",
      apellidos: "Test",
      correo: email,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });

    // Intentamos login con pass mala
    await expect(service.login(email, "Incorrecta1!"))
      .rejects.toThrow("InvalidCredentialsError");
  });

  // =======================================================
  // HU02_E04 – Email con formato no válido
  // =======================================================
  test("HU02_E04 – Formato de email inválido", async () => {
    await expect(
      service.login("email-malo-sin-arroba", "ValidPass1!")
    ).rejects.toThrow("InvalidEmailFormatError");
  });

  // =======================================================
  // HU02_E05 – Contraseña vacía
  // =======================================================
  test("HU02_E05 – Contraseña vacía → error", async () => {
    const email = `hu02e05@test.com`;
    // No creamos usuario, solo validamos inputs
    
    await expect(service.login(email, ""))
      .rejects.toThrow("InvalidCredentialsError");
  });

});
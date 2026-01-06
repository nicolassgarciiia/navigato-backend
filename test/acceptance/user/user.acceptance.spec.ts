import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";

dotenv.config();

describe("HU01 – Registro de usuario (ATDD)", () => {
  let service: UserService;
  let supabaseAdmin: SupabaseClient;

  let emailsToDelete: string[] = [];

  const PASSWORD = "Prueba-34!";

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    service = moduleRef.get(UserService);

    supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );
  });

  // ==========================================================
  // Limpieza automática (solo usuarios creados en el test)
  // ==========================================================
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

  // ============================
  // HU01_E01 – Registro válido
  // ============================
  test("HU01_E01 – Registro válido", async () => {
    const email = `hu01-e01-${randomUUID()}@test.com`;
    emailsToDelete.push(email);

    const result = await service.register({
      nombre: "Prueba",
      apellidos: "García Fernández",
      correo: email,
      contraseña: PASSWORD,
      repetirContraseña: PASSWORD,
      aceptaPoliticaPrivacidad: true,
    });

    expect(result).toBeDefined();
    expect(result.correo).toBe(email);

    // Verificación directa en Supabase
    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const userInSupabase = data.users.find((u) => u.email === email);

    expect(userInSupabase).toBeDefined();
    expect(userInSupabase?.id).toBe(result.id);
  });

  // ======================================
  // HU01_E02 – Email ya registrado
  // ======================================
  test("HU01_E02 – Email ya registrado", async () => {
    const email = `hu01-e02-${randomUUID()}@test.com`;
    emailsToDelete.push(email);

    await service.register({
      nombre: "Prueba",
      apellidos: "García Fernández",
      correo: email,
      contraseña: PASSWORD,
      repetirContraseña: PASSWORD,
      aceptaPoliticaPrivacidad: true,
    });

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: email,
        contraseña: PASSWORD,
        repetirContraseña: PASSWORD,
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("EmailAlreadyRegisteredError");
  });

  // ======================================
  // HU01_E03 – Contraseña inválida
  // ======================================
  test("HU01_E03 – Contraseña inválida", async () => {
    const email = `hu01-e03-${randomUUID()}@test.com`;
    emailsToDelete.push(email);

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: email,
        contraseña: "Ab1!",
        repetirContraseña: "Ab1!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("InvalidPasswordError");
  });

  // ======================================
  // HU01_E04 – Email con formato inválido
  // ======================================
  test("HU01_E04 – Email con formato inválido", async () => {
    const email = `hu01-e04-${randomUUID()}@test.com`;
    emailsToDelete.push(email);

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: "email-malo-sin-arroba",
        contraseña: PASSWORD,
        repetirContraseña: PASSWORD,
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("InvalidEmailFormatError");
  });

  // ======================================
  // HU01_E05 – Contraseñas no coinciden
  // ======================================
  test("HU01_E05 – Contraseñas no coinciden", async () => {
    const email = `hu01-e05-${randomUUID()}@test.com`;
    emailsToDelete.push(email);

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: email,
        contraseña: PASSWORD,
        repetirContraseña: "Otra-35!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("PasswordsDoNotMatchError");
  });

  // ======================================
  // HU01_E06 – Datos personales incompletos
  // ======================================
  test("HU01_E06 – Datos personales incompletos", async () => {
    const email = `hu01-e06-${randomUUID()}@test.com`;
    emailsToDelete.push(email);

    await expect(
      service.register({
        nombre: "",
        apellidos: "García Fernández",
        correo: email,
        contraseña: PASSWORD,
        repetirContraseña: PASSWORD,
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("InvalidPersonalInformationError");
  });

  // ======================================
  // HU01_E07 – Política de privacidad no aceptada
  // ======================================
  test("HU01_E07 – Política no aceptada", async () => {
    const email = `hu01-e07-${randomUUID()}@test.com`;
    emailsToDelete.push(email);

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: email,
        contraseña: PASSWORD,
        repetirContraseña: PASSWORD,
        aceptaPoliticaPrivacidad: false,
      })
    ).rejects.toThrow("PrivacyPolicyNotAcceptedError");
  });
});

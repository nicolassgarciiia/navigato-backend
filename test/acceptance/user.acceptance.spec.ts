import { Test } from "@nestjs/testing";
import { UserModule } from "../../src/modules/user/user.module";
import { UserService } from "../../src/modules/user/application/user.service";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

describe("HU01 – Registro de usuario (ATDD)", () => {
  let service: UserService;
  let supabaseAdmin: SupabaseClient;

  // LISTA DE LIMPIEZA
  let emailsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    service = moduleRef.get(UserService);

    // Inicializar cliente de Supabase con permisos de Admin (Service Role)
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );
  });

  // ==========================================================
  // AFTER EACH: Limpieza automática
  // Se ejecuta SIEMPRE al finalizar cada test (pase o falle)
  // ==========================================================
  afterEach(async () => {
    // Recorremos la lista de emails pendientes de borrar
    for (const email of emailsToDelete) {
      try {
        await service.deleteByEmail(email);
      } catch (error) {
      }
    }
    // Reseteamos la lista para el siguiente test
    emailsToDelete = [];
  });

  // ============================
  // HU01_E01 – Registro válido
  // ============================
  test("HU01_E01 – Registro válido", async () => {
    const email = "prueba_hu01_valido@test.com";
    
    // 1. Agendamos el borrado por si acaso falla el test a mitad
    emailsToDelete.push(email);

    // 2. Ejecución
    const result = await service.register({
      nombre: "Prueba",
      apellidos: "García Fernández",
      correo: email,
      contraseña: "Prueba-34",
      repetirContraseña: "Prueba-34",
      aceptaPoliticaPrivacidad: true,
    });

    
    expect(result).toBeDefined();
    expect(result.correo).toBe(email);

   
    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const userInSupabase = data.users.find((u) => u.email === email);
    
    expect(userInSupabase).toBeDefined(); 
    expect(userInSupabase?.id).toBe(result.id); 
  });

  // ======================================
  // HU01_E02 – Email ya registrado
  // ======================================
  test("HU01_E02 – Email ya registrado", async () => {
    const email = "prueba_hu01_existente@test.com";
    emailsToDelete.push(email); 

    // 1. Crear primero un usuario (Precondición)
    await service.register({
      nombre: "Prueba",
      apellidos: "García Fernández",
      correo: email,
      contraseña: "Prueba-35",
      repetirContraseña: "Prueba-35",
      aceptaPoliticaPrivacidad: true,
    });

    // 2. Intentar registrar otra vez (Debe fallar)
    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: email,
        contraseña: "Prueba-35",
        repetirContraseña: "Prueba-35",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("EmailAlreadyRegisteredError");
  });

  // ======================================
  // HU01_E03 – Contraseña inválida
  // ======================================
  test("HU01_E03 – Contraseña inválida", async () => {
    const email = `hu01e03@test.com`;
    

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
    const email = "email-malo-sin-arroba";

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: email,
        contraseña: "Prueba-34!",
        repetirContraseña: "Prueba-34!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("InvalidEmailFormatError");
  });

  // ======================================
  // HU01_E05 – Contraseñas no coinciden
  // ======================================
  test("HU01_E05 – Contraseñas no coinciden", async () => {
    const email = `hu01e05@test.com`;

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: email,
        contraseña: "Prueba-34!",
        repetirContraseña: "Otra-35!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("PasswordsDoNotMatchError");
  });

  // ======================================
  // HU01_E06 – Datos personales incompletos
  // ======================================
  test("HU01_E06 – Datos personales incompletos", async () => {
    const email = `hu01e06@test.com`;

    await expect(
      service.register({
        nombre: "",
        apellidos: "García Fernández",
        correo: email,
        contraseña: "Prueba-34!",
        repetirContraseña: "Prueba-34!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("InvalidPersonalInformationError");
  });

  // ======================================
  // HU01_E07 – Política de privacidad no aceptada
  // ======================================
  test("HU01_E07 – Política no aceptada", async () => {
    const email = `hu01e07@test.com`;

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: email,
        contraseña: "Prueba-34!",
        repetirContraseña: "Prueba-34!",
        aceptaPoliticaPrivacidad: false,
      })
    ).rejects.toThrow("PrivacyPolicyNotAcceptedError");
  });

});
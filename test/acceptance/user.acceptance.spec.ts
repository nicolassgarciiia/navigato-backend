import { Test } from "@nestjs/testing";
import { UserModule } from "../../src/modules/user/user.module";
import { UserService } from "../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
dotenv.config();


describe("HU01 – Registro de usuario (ATDD)", () => {
  let service: UserService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    service = moduleRef.get(UserService);
  });


  // ============================
  // HU01_E01 – Registro válido
  // ============================
  test("HU01_E01 – Registro válido", async () => {
    const email = "prueba_hu01_valido@test.com";
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
    expect(result.sesion_activa).toBe(true);

    await service.deleteByEmail(email);
  });

  // ======================================
  // HU01_E02 – Email ya registrado
  // ======================================
  test("HU01_E02 – Email ya registrado", async () => {
    const email = "prueba_hu01_existente@test.com";
    // Crear primero un usuario
    await service.register({
      nombre: "Prueba",
      apellidos: "García Fernández",
      correo: email,
      contraseña: "Prueba-35",
      repetirContraseña: "Prueba-35",
      aceptaPoliticaPrivacidad: true,
    });

    // Intentar registrar otra vez
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
    await service.deleteByEmail(email);
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

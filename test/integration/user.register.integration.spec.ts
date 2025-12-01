import { Test } from "@nestjs/testing";
import { UserService } from "../../src/modules/user/application/user.service";
import { UserRepository } from "../../src/modules/user/domain/user.repository";
import { User } from "../../src/modules/user/domain/user.entity";

describe("HU01 – Registro de usuario (INTEGRATION)", () => {
  let service: UserService;
  let repo: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            save: jest.fn(),
            deleteByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(UserService);
    repo = moduleRef.get(UserRepository);
  });

  // =====================================================
  // HU01_E01 – Registro válido
  // =====================================================
  test("HU01_E01 – Registro válido", async () => {
    const email = "correcto@test.com";

    repo.findByEmail.mockResolvedValueOnce(null); // no existe
    repo.save.mockResolvedValue(undefined);
    repo.findByEmail.mockResolvedValueOnce(
      new User({
        id: "123",
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: email,
        contraseña_hash: "xxx",
        sesion_activa: true,
        listaLugares: [],
        listaVehiculos: [],
        listaRutasGuardadas: [],
        preferencias: {},
      })
    );

    const result = await service.register({
      nombre: "Prueba",
      apellidos: "García Fernández",
      correo: email,
      contraseña: "Prueba-34!",
      repetirContraseña: "Prueba-34!",
      aceptaPoliticaPrivacidad: true,
    });

    expect(repo.findByEmail).toHaveBeenCalledWith(email);
    expect(repo.save).toHaveBeenCalled();
    expect(result.correo).toBe(email);
    expect(result.sesion_activa).toBe(true);
  });

  // =====================================================
  // HU01_E02 – Email ya registrado
  // =====================================================
  test("HU01_E02 – Email ya registrado", async () => {
    const email = "ya-existe@test.com";

    repo.findByEmail.mockResolvedValueOnce({} as User);

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: email,
        contraseña: "Prueba-34!",
        repetirContraseña: "Prueba-34!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("EmailAlreadyRegisteredError");
  });

  // =====================================================
  // HU01_E03 – Contraseña inválida
  // =====================================================
  test("HU01_E03 – Contraseña inválida", async () => {
    const email = "invalid-pass@test.com";

    repo.findByEmail.mockResolvedValueOnce(null);

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: email,
        contraseña: "abc",
        repetirContraseña: "abc",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("InvalidPasswordError");
  });

  // =====================================================
  // HU01_E04 – Email con formato inválido
  // =====================================================
  test("HU01_E04 – Email inválido", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: "correo-malo",
        contraseña: "Prueba-34!",
        repetirContraseña: "Prueba-34!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("InvalidEmailFormatError");
  });

  // =====================================================
  // HU01_E05 – Contraseñas no coinciden
  // =====================================================
  test("HU01_E05 – Contraseñas no coinciden", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: "test@test.com",
        contraseña: "Prueba-34!",
        repetirContraseña: "Otra-44!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("PasswordsDoNotMatchError");
  });

  // =====================================================
  // HU01_E06 – Datos personales incompletos
  // =====================================================
  test("HU01_E06 – Datos incompletos", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);

    await expect(
      service.register({
        nombre: "",
        apellidos: "García Fernández",
        correo: "test@test.com",
        contraseña: "Prueba-34!",
        repetirContraseña: "Prueba-34!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("InvalidPersonalInformationError");
  });

  // =====================================================
  // HU01_E07 – Política no aceptada
  // =====================================================
  test("HU01_E07 – Política no aceptada", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: "test@test.com",
        contraseña: "Prueba-34!",
        repetirContraseña: "Prueba-34!",
        aceptaPoliticaPrivacidad: false,
      })
    ).rejects.toThrow("PrivacyPolicyNotAcceptedError");
  });
});

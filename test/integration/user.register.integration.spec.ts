import { Test } from "@nestjs/testing";
import { UserService } from "../../src/modules/user/application/user.service";
import { UserRepository } from "../../src/modules/user/domain/user.repository";
import { User } from "../../src/modules/user/domain/user.entity";

// MOCK Supabase
const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    admin: {
      deleteUser: jest.fn(),
      listUsers: jest.fn(),
    },
  },
};

// createClient SIEMPRE devuelve el mock
jest.mock("@supabase/supabase-js", () => ({
  createClient: () => mockSupabase,
}));

// MOCK UserRepository
const createUserRepositoryMock = () => ({
  save: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
  deleteByEmail: jest.fn(),
});

describe("UserService – HU01 (Integración con mocks)", () => {
  let service: UserService;
  let userRepository: ReturnType<typeof createUserRepositoryMock>;

  beforeEach(async () => {
    jest.clearAllMocks();
    userRepository = createUserRepositoryMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: userRepository },
      ],
    }).compile();

    service = moduleRef.get(UserService);
  });

  // ============================
  // HU01_E01 – Registro válido
  // ============================
  test("HU01_E01 – Registro válido", async () => {
    const email = "prueba_hu01_valido@test.com";

    // No existe en BD
    userRepository.findByEmail.mockResolvedValue(null);

    // Supabase signUp OK
    (mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: "uuid-hu01e01" } },
      error: null,
    });

    const result = await service.register({
      nombre: "Prueba",
      apellidos: "García Fernández",
      correo: email,
      contraseña: "Prueba-34!",
      repetirContraseña: "Prueba-34!",
      aceptaPoliticaPrivacidad: true,
    });

    expect(result).toBeDefined();
    expect(result.correo).toBe(email);
    expect(result.id).toBe("uuid-hu01e01");
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(mockSupabase.auth.signUp).toHaveBeenCalledTimes(1);
  });

  // ======================================
  // HU01_E02 – Email ya registrado
  // ======================================
  test("HU01_E02 – Email ya registrado", async () => {
    const email = "prueba_hu01_existente@test.com";

    // Simulamos que el email ya existe en la BD
    userRepository.findByEmail.mockResolvedValue(
      new User({
        id: "uuid-existente",
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: email,
        contrasenaHash: "hash",
      })
    );

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: email,
        contraseña: "Prueba-35!",
        repetirContraseña: "Prueba-35!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("EmailAlreadyRegisteredError");

    expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
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

    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
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

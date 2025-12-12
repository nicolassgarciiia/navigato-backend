import { Test } from "@nestjs/testing";
import { UserService } from "../../src/modules/user/application/user.service";
import { UserRepository } from "../../src/modules/user/domain/user.repository";
import { User } from "../../src/modules/user/domain/user.entity";

// =================================================================
// 1. DEFINICIÓN DE MOCKS
// =================================================================

// Mock de Supabase: Definimos las funciones con jest.fn() para poder espiarlas
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

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => mockSupabase,
}));

const createUserRepositoryMock = () => ({
  save: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
  deleteByEmail: jest.fn(),
});

describe("UserService – HU01 (Unit Testing con Mocks)", () => {
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

  // =================================================================
  // HU01_E01 – Registro válido (HAPPY PATH BLINDADO)
  // =================================================================
  test("HU01_E01 – Registro válido", async () => {
    const email = "prueba_hu01_valido@test.com";
    const rawPassword = "Prueba-34!";

    // 1. Configurar comportamiento de los Mocks (Arrange)
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(true);

    (mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: "uuid-generado-por-supabase", email: email } },
      error: null,
    });

    const result = await service.register({
      nombre: "Prueba",
      apellidos: "García Fernández",
      correo: email,
      contraseña: rawPassword,
      repetirContraseña: rawPassword,
      aceptaPoliticaPrivacidad: true,
    });

    
    expect(result).toBeDefined();
    expect(result.correo).toBe(email);
    expect(result.id).toBe("uuid-generado-por-supabase"); 

    expect(mockSupabase.auth.signUp).toHaveBeenCalledTimes(1);
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: email,
      password: rawPassword,
      options: {
        data: {
          nombre: "Prueba",
          apellidos: "García Fernández",
        },
      },
    });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: "Prueba",
        apellidos: "García Fernández",
        correo: email,
        id: "uuid-generado-por-supabase", 
        contrasenaHash: expect.any(String) 
      })
    );
  });

  // =================================================================
  // HU01_E02 – Email ya registrado
  // =================================================================
  test("HU01_E02 – Email ya registrado", async () => {
    const email = "prueba_hu01_existente@test.com";

    userRepository.findByEmail.mockResolvedValue(
      new User({
        id: "uuid-existente",
        nombre: "Prueba",
        apellidos: "García",
        correo: email,
        contrasenaHash: "hash-existente",
      })
    );

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García",
        correo: email,
        contraseña: "Prueba-35!",
        repetirContraseña: "Prueba-35!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("EmailAlreadyRegisteredError");

    expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  // =================================================================
  // HU01_E03 – Contraseña inválida
  // =================================================================
  test("HU01_E03 – Contraseña inválida", async () => {
    const email = `hu01e03@test.com`;

    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García",
        correo: email,
        contraseña: "Ab1!", // Muy corta / mala
        repetirContraseña: "Ab1!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("InvalidPasswordError");

    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  // =================================================================
  // HU01_E04 – Email con formato inválido
  // =================================================================
  test("HU01_E04 – Email con formato inválido", async () => {
    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García",
        correo: "email-sin-arroba",
        contraseña: "Prueba-34!",
        repetirContraseña: "Prueba-34!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("InvalidEmailFormatError");

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
  });

  // =================================================================
  // HU01_E05 – Contraseñas no coinciden
  // =================================================================
  test("HU01_E05 – Contraseñas no coinciden", async () => {
    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García",
        correo: "test@test.com",
        contraseña: "Prueba-34!",
        repetirContraseña: "Otra-Cosa-35!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("PasswordsDoNotMatchError");

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
  });

  // =================================================================
  // HU01_E06 – Datos personales incompletos
  // =================================================================
  test("HU01_E06 – Datos personales incompletos", async () => {
    await expect(
      service.register({
        nombre: "", // Vacío
        apellidos: "García",
        correo: "test@test.com",
        contraseña: "Prueba-34!",
        repetirContraseña: "Prueba-34!",
        aceptaPoliticaPrivacidad: true,
      })
    ).rejects.toThrow("InvalidPersonalInformationError");

    expect(userRepository.save).not.toHaveBeenCalled();
  });

  // =================================================================
  // HU01_E07 – Política de privacidad no aceptada
  // =================================================================
  test("HU01_E07 – Política no aceptada", async () => {
    await expect(
      service.register({
        nombre: "Prueba",
        apellidos: "García",
        correo: "test@test.com",
        contraseña: "Prueba-34!",
        repetirContraseña: "Prueba-34!",
        aceptaPoliticaPrivacidad: false, // FALSE
      })
    ).rejects.toThrow("PrivacyPolicyNotAcceptedError");

    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
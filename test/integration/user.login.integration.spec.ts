import { Test } from "@nestjs/testing";
import { UserService } from "../../src/modules/user/application/user.service";
import { UserRepository } from "../../src/modules/user/domain/user.repository";
import { User } from "../../src/modules/user/domain/user.entity";
import * as crypto from "crypto";

// =================================================================
// DEFINICIÓN DE MOCKS
// =================================================================
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

describe("UserService – HU02 (Unit Testing con Mocks)", () => {
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

  // =======================================================
  // HU02_E01 – Inicio de sesión correcto (HAPPY PATH)
  // =======================================================
  test("HU02_E01 – Credenciales correctas → inicio correcto", async () => {
    const email = `hu02e01@test.com`;
    const password = "ValidPass1!";

    // 1. Arrange: Usuario existe en BD local
    userRepository.findByEmail.mockResolvedValue(
      new User({
        id: "uuid-hu02e01",
        nombre: "Prueba",
        apellidos: "Test",
        correo: email,
        contrasenaHash: "hash-irrelevante-aqui", 
      })
    );


    (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { 
        session: { access_token: "token-hu02-e01" },
        user: { email: email } 
      },
      error: null,
    });

    const result = await service.login(email, password);

    expect(result).toBeDefined();
    expect(result.user.correo).toBe(email);
    expect(result.access_token).toBe("token-hu02-e01");

    expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: email,
      password: password,
    });
  });

  // =======================================================
  // HU02_E02 – Email no existe en el sistema
  // =======================================================
  test("HU02_E02 – Email inexistente → error", async () => {
    const email = `hu02e02@test.com`;


    userRepository.findByEmail.mockResolvedValue(null);

    await expect(service.login(email, "ValidPass1!")).rejects.toThrow(
      "UserNotFoundError"
    );

    expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  // =======================================================
  // HU02_E03 – Contraseña incorrecta
  // =======================================================
  test("HU02_E03 – Contraseña incorrecta → error", async () => {
    const email = `hu02e03@test.com`;
    const wrongPass = "Incorrecta1!";

    // Arrange: El usuario SÍ existe en local
    userRepository.findByEmail.mockResolvedValue(
      new User({
        id: "uuid-hu02e03",
        nombre: "Prueba",
        apellidos: "Test",
        correo: email,
        contrasenaHash: "hash",
      })
    );

    (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" },
    });

    await expect(service.login(email, wrongPass)).rejects.toThrow(
      "InvalidCredentialsError"
    );

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: email,
      password: wrongPass,
    });
  });

  // =======================================================
  // HU02_E04 – Email con formato no válido
  // =======================================================
  test("HU02_E04 – Formato de email inválido", async () => {
    await expect(
      service.login("email-malo", "ValidPass1!")
    ).rejects.toThrow("InvalidEmailFormatError");


    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  // =======================================================
  // HU02_E05 – Contraseña vacía
  // =======================================================
  test("HU02_E05 – Contraseña vacía → error", async () => {
    const email = `hu02e05_${crypto.randomUUID()}@test.com`;

    await expect(service.login(email, "")).rejects.toThrow(
      "InvalidCredentialsError"
    );

    expect(userRepository.findByEmail).not.toHaveBeenCalled(); 
    expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });
});
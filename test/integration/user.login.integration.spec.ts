import { Test } from "@nestjs/testing";
import { UserService } from "../../src/modules/user/application/user.service";
import { UserRepository } from "../../src/modules/user/domain/user.repository";
import { User } from "../../src/modules/user/domain/user.entity";
import * as crypto from "crypto";

// Mismo mock de Supabase
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

describe("UserService – HU02 (Integración con mocks)", () => {
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
  // HU02_E01 – Inicio de sesión correcto
  // =======================================================
  test("HU02_E01 – Credenciales correctas → inicio correcto", async () => {
    const email = `hu02e01@test.com`;

    // Usuario existe en BD
    userRepository.findByEmail.mockResolvedValue(
      new User({
        id: "uuid-hu02e01",
        nombre: "Prueba",
        apellidos: "Test",
        correo: email,
        contrasenaHash: "hash",
      })
    );

    // Supabase login OK
    (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { session: { access_token: "token-hu02-e01" } },
      error: null,
    });

    const result = await service.login(email, "ValidPass1!");

    expect(result).toBeDefined();
    expect(result.user.correo).toBe(email);
    expect(result.access_token).toBe("token-hu02-e01");
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

    await expect(service.login(email, "Incorrecta1!")).rejects.toThrow(
      "InvalidCredentialsError"
    );
  });

  // =======================================================
  // HU02_E04 – Email con formato no válido
  // =======================================================
  test("HU02_E04 – Formato de email inválido", async () => {
    await expect(
      service.login("email-malo", "ValidPass1!")
    ).rejects.toThrow("InvalidEmailFormatError");
  });

  // =======================================================
  // HU02_E05 – Contraseña vacía
  // =======================================================
  test("HU02_E05 – Contraseña vacía → error", async () => {
    const email = `hu02e05_${crypto.randomUUID()}@test.com`;

    await expect(service.login(email, "")).rejects.toThrow(
      "InvalidCredentialsError"
    );
  });
});

import { Test } from "@nestjs/testing";
import { UserService } from "../../src/modules/user/application/user.service";
import { UserRepository } from "../../src/modules/user/domain/user.repository";
import { User } from "../../src/modules/user/domain/user.entity";

// Supabase mock
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

describe("UserService – HU04 (Integración con mocks)", () => {
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

  // ======================================================
  // HU04_E01 – Eliminación exitosa de la cuenta
  // ======================================================
  test("HU04_E01 – Eliminación exitosa de la cuenta", async () => {
    const email = `hu04e01@test.com`;

    const fakeUser = new User({
      id: "uuid-hu04e01",
      nombre: "Activo",
      apellidos: "García Edo",
      correo: email,
      contrasenaHash: "hash",
    });

    userRepository.findByEmail.mockResolvedValue(fakeUser);
    (mockSupabase.auth.admin.deleteUser as jest.Mock).mockResolvedValue({
      error: null,
    });

    const result = await service.deleteAccount(email);

    expect(result).toBeDefined();
    expect(result.correo).toBe(email);
    expect(mockSupabase.auth.admin.deleteUser).toHaveBeenCalledWith(
      fakeUser.id
    );
    expect(userRepository.deleteByEmail).toHaveBeenCalledWith(email);
  });

  // ======================================================
  // HU04_E02 – Intento de borrado sin usuario
  // ======================================================
  test("HU04_E02 – Usuario no existe o error de lógica", async () => {
    const email = "no-existe@test.com";

    userRepository.findByEmail.mockResolvedValue(null);

    await expect(service.deleteAccount(email)).rejects.toThrow(
      "UserNotFoundError"
    );

    expect(mockSupabase.auth.admin.deleteUser).not.toHaveBeenCalled();
    expect(userRepository.deleteByEmail).not.toHaveBeenCalled();
  });
});

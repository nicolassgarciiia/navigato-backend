import { Test } from "@nestjs/testing";
import { UserService } from "../../src/modules/user/application/user.service";
import { UserRepository } from "../../src/modules/user/domain/user.repository";
import { User } from "../../src/modules/user/domain/user.entity";

// =================================================================
// DEFINICIÓN DE MOCKS
// =================================================================
const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(), 
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

describe("UserService – HU03 (Unit Testing con Mocks)", () => {
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
  // HU03_E01 – Cierre de sesión exitoso
  // ======================================================
  test("HU03_E01 – Cierre de sesión exitoso", async () => {
    const email = `hu03e01@test.com`;

    userRepository.findByEmail.mockResolvedValue(
      new User({
        id: "uuid-hu03e01",
        nombre: "Usuario",
        apellidos: "Activo",
        correo: email,
        contrasenaHash: "hash",
      })
    );

    (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

    await expect(service.logout(email)).resolves.not.toThrow();

    expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(email);

  });

  // ======================================================
  // HU03_E02 – Usuario no encontrado (Comportamiento actual)
  // ======================================================
  test("HU03_E02 – Intento de logout con email inexistente", async () => {
    const email = `hu03e02@test.com`;

    userRepository.findByEmail.mockResolvedValue(null);

    await expect(service.logout(email)).rejects.toThrow("UserNotFoundError");

    expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    
    expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
  });
});
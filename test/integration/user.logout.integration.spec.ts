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

describe("UserService – HU03 (Integración con mocks)", () => {
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

    await expect(service.logout(email)).resolves.not.toThrow();
  });

  // ======================================================
  // HU03_E02 – Idempotencia (Cerrar sesión si no existe)
  // ======================================================
  test("HU03_E02 – Cerrar sesión repetida (Idempotencia)", async () => {
    const email = `hu03e02@test.com`;

    userRepository.findByEmail.mockResolvedValueOnce(
      new User({
        id: "uuid-hu03e02",
        nombre: "Usuario",
        apellidos: "Inactivo",
        correo: email,
        contrasenaHash: "hash",
      })
    );
    userRepository.findByEmail.mockResolvedValueOnce(null);

    // Primer logout (usuario existe)
    await expect(service.logout(email)).resolves.not.toThrow();

    // Segundo logout (usuario ya no existe)
    await expect(service.logout(email)).rejects.toThrow("UserNotFoundError");
  });
});

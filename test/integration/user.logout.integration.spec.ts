import { Test } from "@nestjs/testing";
import { UserService } from "../../src/modules/user/application/user.service";
import { UserRepository } from "../../src/modules/user/domain/user.repository";
import { User } from "../../src/modules/user/domain/user.entity";
import * as bcrypt from "bcryptjs";

describe("HU03 – Cerrar sesión (INTEGRATION)", () => {
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
            update: jest.fn(),
            deleteByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(UserService);
    repo = moduleRef.get(UserRepository);
  });

  // ======================================================
  // HU03_E01 – Cierre de sesión exitoso
  // ======================================================
  test("HU03_E01 – Cierre de sesión exitoso", async () => {
    const email = "hu03e01@test.com";

    const hash = await bcrypt.hash("ValidPass1!", 10);

    // Usuario EXISTE y tiene sesión activa
    const user = new User({
      id: "1",
      nombre: "Usuario",
      apellidos: "Activo",
      correo: email,
      contraseña_hash: hash,
      sesion_activa: true,
      listaLugares: [],
      listaVehiculos: [],
      listaRutasGuardadas: [],
      preferencias: {},
    });

    repo.findByEmail.mockResolvedValueOnce(user);
    repo.update.mockResolvedValue(undefined);

    const result = await service.logout(email);

    expect(result).toBeDefined();
    expect(result.sesion_activa).toBe(false);
    expect(repo.update).toHaveBeenCalled();
  });

  // ======================================================
  // HU03_E02 – No existe sesión activa
  // ======================================================
  test("HU03_E02 – No hay sesión activa → error", async () => {
    const email = "hu03e02@test.com";

    const hash = await bcrypt.hash("ValidPass1!", 10);

    // Usuario existe pero NO tiene sesión activa
    const user = new User({
      id: "2",
      nombre: "Usuario",
      apellidos: "Inactivo",
      correo: email,
      contraseña_hash: hash,
      sesion_activa: false, // 🔥 clave
      listaLugares: [],
      listaVehiculos: [],
      listaRutasGuardadas: [],
      preferencias: {},
    });

    repo.findByEmail.mockResolvedValueOnce(user);

    await expect(service.logout(email))
      .rejects.toThrow("NoUserAuthenticatedError");
  });

  // ======================================================
  // HU03_E03 – Usuario no existe
  // ======================================================
  test("HU03_E03 – Usuario no encontrado", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);

    await expect(service.logout("noexiste@test.com"))
      .rejects.toThrow("UserNotFoundError");
  });

  // ======================================================
  // HU03_E04 – Error inesperado BD (findByEmail lanza excepción)
  // ======================================================
  test("HU03_E04 – Error inesperado en BD", async () => {
    repo.findByEmail.mockRejectedValueOnce(new Error("DB crashed"));

    await expect(service.logout("test@test.com"))
      .rejects.toThrow("UnexpectedDatabaseError");
  });

  // ======================================================
  // HU03_E05 – Error inesperado BD (update lanza excepción)
  // ======================================================
  test("HU03_E05 – Error inesperado al actualizar BD", async () => {
    const email = "hu03e05@test.com";
    const hash = await bcrypt.hash("ValidPass1!", 10);

    const user = new User({
      id: "3",
      nombre: "Usuario",
      apellidos: "Activo",
      correo: email,
      contraseña_hash: hash,
      sesion_activa: true,
      listaLugares: [],
      listaVehiculos: [],
      listaRutasGuardadas: [],
      preferencias: {},
    });

    repo.findByEmail.mockResolvedValueOnce(user);
    repo.update.mockRejectedValueOnce(new Error("DB crashed"));

    await expect(service.logout(email))
      .rejects.toThrow("UnexpectedDatabaseError");
  });
});

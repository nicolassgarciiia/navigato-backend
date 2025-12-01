import { Test } from "@nestjs/testing";
import { UserService } from "../../src/modules/user/application/user.service";
import { UserRepository } from "../../src/modules/user/domain/user.repository";
import { User } from "../../src/modules/user/domain/user.entity";
import * as bcrypt from "bcryptjs";

describe("HU04 – Eliminar cuenta de usuario (INTEGRATION)", () => {
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
  // HU04_E01 – Eliminación exitosa de la cuenta
  // ======================================================
  test("HU04_E01 – Eliminación exitosa de la cuenta", async () => {
    const email = "hu04e01@test.com";
    const hash = await bcrypt.hash("ValidPass1!", 10);

    // Usuario autenticado (sesion_activa = true)
    const user = new User({
      id: "1",
      nombre: "Activo",
      apellidos: "García Edo",
      correo: email,
      contraseña_hash: hash,
      sesion_activa: true,
      listaLugares: [{ lugar: "Alicante" }],
      listaVehiculos: [{ id: "v1" }],
      listaRutasGuardadas: [{ id: "r1" }],
      preferencias: { theme: "dark" },
    });

    // findByEmail antes de borrar
    repo.findByEmail.mockResolvedValueOnce(user);

    // update() → para limpiar datos + poner sesion_activa = false
    repo.update.mockResolvedValue(undefined);

    // deleteByEmail() → borrar usuario
    repo.deleteByEmail.mockResolvedValue(undefined);

    // findByEmail después de borrar → debe devolver null
    repo.findByEmail.mockResolvedValueOnce(null);

    const result = await service.deleteAccount(email);

    expect(result).toBeDefined();
    expect(result.correo).toBe(email);
    expect(result.sesion_activa).toBe(false);

    const afterDeletion = await service.findByEmail(email);
    expect(afterDeletion).toBeNull();
  });

  // ======================================================
  // HU04_E02 – Usuario NO autenticado intenta eliminar su cuenta
  // ======================================================
  test("HU04_E02 – Usuario no autenticado → error", async () => {
    const email = "hu04e02@test.com";
    const hash = await bcrypt.hash("ValidPass1!", 10);

    const inactiveUser = new User({
      id: "2",
      nombre: "Inactivo",
      apellidos: "García Edo",
      correo: email,
      contraseña_hash: hash,
      sesion_activa: false, // ❌ no autenticado
      listaLugares: [],
      listaVehiculos: [],
      listaRutasGuardadas: [],
      preferencias: {},
    });

    // findByEmail devuelve un usuario sin sesión activa
    repo.findByEmail.mockResolvedValueOnce(inactiveUser);

    await expect(service.deleteAccount(email))
      .rejects.toThrow("AuthenticationRequiredError");

    // findByEmail tras el error → usuario sigue existiendo
    repo.findByEmail.mockResolvedValueOnce(inactiveUser);

    const stillExists = await service.findByEmail(email);
    expect(stillExists).not.toBeNull();
  });

  // ======================================================
  // HU04_E03 – Usuario no encontrado
  // ======================================================
  test("HU04_E03 – Usuario no encontrado", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);

    await expect(service.deleteAccount("noexiste@test.com"))
      .rejects.toThrow("AuthenticationRequiredError");
  });

  // ======================================================
  // HU04_E04 – Error inesperado al ejecutar findByEmail()
  // ======================================================
  test("HU04_E04 – Error inesperado BD (findByEmail)", async () => {
    repo.findByEmail.mockRejectedValueOnce(new Error("DB crashed"));

    await expect(service.deleteAccount("test@test.com"))
      .rejects.toThrow("UnexpectedDatabaseError");
  });

  // ======================================================
  // HU04_E05 – Error inesperado al update()
  // ======================================================
  test("HU04_E05 – Error inesperado BD (update)", async () => {
    const email = "hu04e05@test.com";
    const hash = await bcrypt.hash("Pass123!", 10);

    const user = new User({
      id: "4",
      nombre: "Test",
      apellidos: "User",
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

    await expect(service.deleteAccount(email))
      .rejects.toThrow("UnexpectedDatabaseError");
  });

  // ======================================================
  // HU04_E06 – Error inesperado al deleteByEmail()
  // ======================================================
  test("HU04_E06 – Error inesperado BD (deleteByEmail)", async () => {
    const email = "hu04e06@test.com";
    const hash = await bcrypt.hash("Pass123!", 10);

    const user = new User({
      id: "5",
      nombre: "Test",
      apellidos: "User",
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
    repo.deleteByEmail.mockRejectedValueOnce(new Error("DB crashed"));

    await expect(service.deleteAccount(email))
      .rejects.toThrow("UnexpectedDatabaseError");
  });
});

import { Test } from "@nestjs/testing";
import { UserService } from "../../src/modules/user/application/user.service";
import { UserRepository } from "../../src/modules/user/domain/user.repository";
import { User } from "../../src/modules/user/domain/user.entity";
import * as bcrypt from "bcryptjs";

describe("HU02 – Inicio de sesión (INTEGRATION)", () => {
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

  // =======================================================
  // HU02_E01 – Inicio de sesión correcto
  // =======================================================
  test("HU02_E01 – Credenciales correctas → inicio correcto", async () => {
    const email = "hu02e01@test.com";
    const hash = await bcrypt.hash("ValidPass1!", 10);

    const user = new User({
      id: "1",
      nombre: "Prueba",
      apellidos: "Test",
      correo: email,
      contraseña_hash: hash,
      sesion_activa: false,
      listaLugares: [],
      listaVehiculos: [],
      listaRutasGuardadas: [],
      preferencias: {},
    });

    // El usuario existe y tiene sesión inactiva
    repo.findByEmail.mockResolvedValueOnce(user);

    // update() simplemente resuelve
    repo.update.mockResolvedValue(undefined);

    const result = await service.login(email, "ValidPass1!");

    expect(result).toBeDefined();
    expect(result.sesion_activa).toBe(true);
    expect(repo.update).toHaveBeenCalled();
  });

  // =======================================================
  // HU02_E02 – Email no existe en el sistema
  // =======================================================
  test("HU02_E02 – Email inexistente → error", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);

    await expect(service.login("noexiste@test.com", "ValidPass1!"))
      .rejects.toThrow("UserNotFoundError");
  });

  // =======================================================
  // HU02_E03 – Contraseña incorrecta
  // =======================================================
  test("HU02_E03 – Contraseña incorrecta → error", async () => {
    const email = "hu02e03@test.com";
    const hash = await bcrypt.hash("ValidPass1!", 10);

    const user = new User({
      id: "2",
      nombre: "Prueba",
      apellidos: "Test",
      correo: email,
      contraseña_hash: hash,
      sesion_activa: false,
      listaLugares: [],
      listaVehiculos: [],
      listaRutasGuardadas: [],
      preferencias: {},
    });

    repo.findByEmail.mockResolvedValueOnce(user);

    await expect(service.login(email, "Incorrecta1!"))
      .rejects.toThrow("InvalidCredentialsError");
  });

  // =======================================================
  // HU02_E04 – Email con formato no válido
  // =======================================================
  test("HU02_E04 – Formato de email inválido", async () => {
    await expect(service.login("email-malo", "ValidPass1!"))
      .rejects.toThrow("InvalidEmailFormatError");
  });

  // =======================================================
  // HU02_E05 – Contraseña vacía o no válida
  // =======================================================
  test("HU02_E05 – Contraseña vacía → error", async () => {
    await expect(service.login("test@test.com", ""))
      .rejects.toThrow("InvalidCredentialsError");
  });

  // =======================================================
  // HU02_E06 – Usuario ya con sesión activa
  // =======================================================
  test("HU02_E06 – Usuario ya tiene sesión activa", async () => {
    const email = "hu02e06@test.com";
    const hash = await bcrypt.hash("ValidPass1!", 10);

    const user = new User({
      id: "3",
      nombre: "Prueba",
      apellidos: "Test",
      correo: email,
      contraseña_hash: hash,
      sesion_activa: true, // 🔥 ya en sesión
      listaLugares: [],
      listaVehiculos: [],
      listaRutasGuardadas: [],
      preferencias: {},
    });

    repo.findByEmail.mockResolvedValueOnce(user);

    await expect(service.login(email, "ValidPass1!"))
      .rejects.toThrow("SessionAlreadyActiveError");
  });

  // =======================================================
  // HU02_E07 – Error inesperado de BD (findByEmail lanza excepción)
  // =======================================================
  test("HU02_E07 – Error inesperado en BD", async () => {
    repo.findByEmail.mockRejectedValueOnce(new Error("DB crashed"));

    await expect(service.login("test@test.com", "ValidPass1!"))
      .rejects.toThrow("UnexpectedDatabaseError");
  });
});

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
    listaLugares: [],
    listaVehiculos: [],
    listaRutasGuardadas: [],
    preferencias: {},
  });

  // El usuario existe
  repo.findByEmail.mockResolvedValueOnce(user);

  const result = await service.login(email, "ValidPass1!");

  expect(result).toBeDefined();
  expect(result.correo).toBe(email);

  expect(repo.findByEmail).toHaveBeenCalledWith(email);

  expect(repo.update).not.toHaveBeenCalled();
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
});

import { Test } from "@nestjs/testing";
import { UserPreferencesService } from "../../../src/modules/user-preferences/application/user-preferences.service";
import { UserPreferencesRepository } from "../../../src/modules/user-preferences/domain/user-preferences.repository";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { VehicleRepository } from "../../../src/modules/vehicle/domain/vehicle.repository";

describe("HU22 – Establecer tipo de ruta por defecto (INTEGRATION)", () => {
  let service: UserPreferencesService;

  const userRepositoryMock = {
    findByEmail: jest.fn(),
  };

  const preferencesRepositoryMock = {
    setDefaultRouteType: jest.fn(),
  };

  // 👇 MOCK NECESARIO AUNQUE NO SE USE EN HU22
  const vehicleRepositoryMock = {
    findByIdAndUser: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserPreferencesService,
        { provide: UserRepository, useValue: userRepositoryMock },
        {
          provide: UserPreferencesRepository,
          useValue: preferencesRepositoryMock,
        },
        {
          provide: VehicleRepository,
          useValue: vehicleRepositoryMock,
        },
      ],
    }).compile();

    service = moduleRef.get(UserPreferencesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // HU22_E01 – Caso válido
  // =========================
  test("HU22_E01 – Establece tipo de ruta por defecto", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
    });

    preferencesRepositoryMock.setDefaultRouteType.mockResolvedValue(undefined);

    await service.setDefaultRouteType(
      "usuario@test.com",
      "rapida"
    );

    expect(
      preferencesRepositoryMock.setDefaultRouteType
    ).toHaveBeenCalledWith("user-1", "rapida");
  });

  // =========================
  // HU22_E02 – Usuario no autenticado
  // =========================
  test("HU22_E02 – Error si no hay sesión", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    await expect(
      service.setDefaultRouteType(
        "usuario@test.com",
        "economica"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // =========================
  // HU22_E03 – Tipo de ruta inválido
  // =========================
  test("HU22_E03 – Error si el tipo de ruta no existe", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
    });

    await expect(
      service.setDefaultRouteType(
        "usuario@test.com",
        "voladora"
      )
    ).rejects.toThrow("InvalidRouteTypeError");
  });
});

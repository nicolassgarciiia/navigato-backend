import { Test } from "@nestjs/testing";
import { UserPreferencesService } from "../../../src/modules/user-preferences/application/user-preferences.service";
import { UserPreferencesRepository } from "../../../src/modules/user-preferences/domain/user-preferences.repository";
import { UserPreferences } from "../../../src/modules/user-preferences/domain/user-preferences.entity";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { VehicleRepository } from "../../../src/modules/vehicle/domain/vehicle.repository";

describe("HU21 – Establecer vehículo por defecto (INTEGRATION con mocks)", () => {
  let service: UserPreferencesService;

  // =========================
  // Mocks
  // =========================
  const userRepositoryMock = {
    findByEmail: jest.fn(),
  };

  const vehicleRepositoryMock = {
    findByIdAndUser: jest.fn(),
  };

  const preferencesRepositoryMock = {
    findByUserId: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserPreferencesService,
        { provide: UserRepository, useValue: userRepositoryMock },
        { provide: VehicleRepository, useValue: vehicleRepositoryMock },
        { provide: UserPreferencesRepository, useValue: preferencesRepositoryMock },
      ],
    }).compile();

    service = moduleRef.get(UserPreferencesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================================================
  // HU21_E01 – Escenario válido
  // ==================================================
  test("HU21_E01 – Establece el vehículo por defecto correctamente", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      correo: "usuario@test.com",
    });

    vehicleRepositoryMock.findByIdAndUser.mockResolvedValue({
      id: "vehicle-1",
    });

    preferencesRepositoryMock.findByUserId.mockResolvedValue(
      new UserPreferences({ userId: "user-1" })
    );

    await service.setDefaultVehicle("usuario@test.com", "vehicle-1");

    expect(preferencesRepositoryMock.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        defaultVehicleId: "vehicle-1",
      })
    );
  });

  // ==================================================
  // HU21_E02 – Vehículo no existe
  // ==================================================
  test("HU21_E02 – Error si el vehículo no existe", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
    });

    vehicleRepositoryMock.findByIdAndUser.mockResolvedValue(null);

    await expect(
      service.setDefaultVehicle("usuario@test.com", "vehicle-inexistente")
    ).rejects.toThrow("ElementNotFoundError");
  });

  // ==================================================
  // HU21_E04 – Usuario no autenticado
  // ==================================================
  test("HU21_E04 – Error si el usuario no está autenticado", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    await expect(
      service.setDefaultVehicle("no-existe@test.com", "vehicle-1")
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

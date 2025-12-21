import { Test } from "@nestjs/testing";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { VehicleRepository } from "../../../src/modules/vehicle/domain/vehicle.repository";
import { Vehicle } from "../../../src/modules/vehicle/domain/vehicle.entity";

describe("HU20 – Marcar vehículo como favorito (INTEGRATION - mocks)", () => {
  let vehicleService: VehicleService;

  const email = "hu20_integration@test.com";
  const userId = "user-123";
  const vehicleId = "vehicle-123";
  
  const mockUser = {
    id: userId,
    correo: email,
    sesion_activa: true,
  };

  
  const mockUserRepository = {
    findByEmail: jest.fn(),
  };

  const mockVehicleRepository = {
    findByIdAndUser: jest.fn(),
    setFavorite: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [VehicleModule],
    })
      .overrideProvider(UserRepository)
      .useValue(mockUserRepository)
      .overrideProvider(VehicleRepository)
      .useValue(mockVehicleRepository)
      .compile();

    vehicleService = moduleRef.get(VehicleService);

    jest.clearAllMocks();

    // ===== DEFAULT MOCK BEHAVIOUR =====
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    mockVehicleRepository.findByIdAndUser.mockResolvedValue(
      new Vehicle({
        id: vehicleId,
        nombre: "Coche",
        matricula: "1234ABC",
        tipo: "COMBUSTION",
        consumo: 6.5,
        favorito: false,
      })
    );

    mockVehicleRepository.setFavorite.mockResolvedValue(undefined);
  });

  // ======================================
  // HU20_E01 – Escenario válido
  // ======================================
  test("HU20_E01 – Marcar vehículo como favorito", async () => {
    await expect(
      vehicleService.setVehicleFavorite(email, vehicleId, true)
    ).resolves.toBeUndefined();

    expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(mockVehicleRepository.findByIdAndUser).toHaveBeenCalledTimes(1);
    expect(mockVehicleRepository.setFavorite).toHaveBeenCalledTimes(1);
    expect(mockVehicleRepository.setFavorite).toHaveBeenCalledWith(
      vehicleId,
      true
    );
  });

  // ======================================
  // HU20_E02 – Usuario no autenticado
  // ======================================
  test("HU20_E02 – Usuario no autenticado", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      vehicleService.setVehicleFavorite(email, vehicleId, true)
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // ======================================
  // HU20_E03 – Vehículo no existe
  // ======================================
  test("HU20_E03 – Vehículo no existe", async () => {
    mockVehicleRepository.findByIdAndUser.mockRejectedValue(
      new Error("invalid uuid")
    );

    await expect(
      vehicleService.setVehicleFavorite(email, "vehiculo-inexistente", true)
    ).rejects.toThrow("VehicleNotFoundError");
  });
});

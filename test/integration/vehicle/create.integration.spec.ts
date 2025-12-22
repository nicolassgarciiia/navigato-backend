import { Test } from "@nestjs/testing";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { VehicleRepository } from "../../../src/modules/vehicle/domain/vehicle.repository";

describe("HU09 – Alta de vehículo (INTEGRATION - mocks)", () => {
  let vehicleService: VehicleService;

  const email = "hu09_integration@test.com";

  // ===== MOCKS =====
  const mockUser = {
    id: "user-123",
    nombre: "Usuario Integracion",
    correo: email,
  };

  const mockUserRepository = {
    findByEmail: jest.fn(),
  };

  const mockVehicleRepository = {
    save: jest.fn(),
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

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockVehicleRepository.save.mockResolvedValue(undefined);
  });

  // ======================================
  // HU09_E01 – Escenario válido
  // ======================================
  test("HU09_E01 – Alta de vehículo con datos válidos", async () => {
    const vehicle = await vehicleService.createVehicle(
      email,
      "Coche familiar",
      "7750LHF",
      "COMBUSTION",
      6.5
    );

    expect(vehicle).toBeDefined();
    expect(vehicle.nombre).toBe("Coche familiar");
    expect(vehicle.matricula).toBe("7750LHF");
    expect(vehicle.tipo).toBe("COMBUSTION");
    expect(vehicle.consumo).toBe(6.5);
    expect(vehicle.favorito).toBe(false);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(mockVehicleRepository.save).toHaveBeenCalledTimes(1);
  });

  // ======================================
  // HU09_E02 – Consumo inválido
  // ======================================
  test("HU09_E02 – Consumo negativo → error", async () => {
    await expect(
      vehicleService.createVehicle(
        email,
        "Coche roto",
        "1234ABC",
        "COMBUSTION",
        -10
      )
    ).rejects.toThrow("InvalidVehicleConsumptionError");
  });

  // ======================================
  // HU09_E03 – Usuario no autenticado
  // ======================================
  test("HU09_E03 – Usuario no autenticado", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      vehicleService.createVehicle(
        "no-existe@test.com",
        "Coche",
        "0000AAA",
        "COMBUSTION",
        5
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});
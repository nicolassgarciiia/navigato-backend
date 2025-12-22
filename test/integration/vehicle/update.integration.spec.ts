import { Test } from "@nestjs/testing";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { VehicleRepository } from "../../../src/modules/vehicle/domain/vehicle.repository";
import { Vehicle } from "../../../src/modules/vehicle/domain/vehicle.entity";

describe("HU12 – Modificar vehículo (INTEGRATION - mocks)", () => {
  let vehicleService: VehicleService;

  const email = "hu12_integration@test.com";
  const userId = "user-123";
  const vehicleId = "vehicle-123";

  // ===== MOCK USER =====
  const mockUser = {
    id: userId,
    correo: email,
    sesion_activa: true,
  };

  // ===== MOCK REPOSITORIES =====
  const mockUserRepository = {
    findByEmail: jest.fn(),
  };

  const mockVehicleRepository = {
    findByIdAndUser: jest.fn(),
    update: jest.fn(), // 👈 CAMBIO CLAVE
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

    mockVehicleRepository.update.mockResolvedValue(undefined);
  });

  // ======================================
  // HU12_E01 – Modificar consumo de vehículo
  // ======================================
  test("HU12_E01 – Modificar consumo de vehículo", async () => {
    await expect(
      vehicleService.updateVehicle(email, vehicleId, { consumo: 5.4 })
    ).resolves.toBeUndefined();

    expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(mockVehicleRepository.findByIdAndUser).toHaveBeenCalledTimes(1);
    expect(mockVehicleRepository.update).toHaveBeenCalledTimes(1);

    const updatedVehicle = mockVehicleRepository.update.mock.calls[0][0];
    expect(updatedVehicle.consumo).toBe(5.4);
  });

  // ======================================
  // HU12_E02 – Modificar nombre del vehículo
  // ======================================
  test("HU12_E02 – Modificar nombre del vehículo", async () => {
    await expect(
      vehicleService.updateVehicle(email, vehicleId, { nombre: "Coche nuevo" })
    ).resolves.toBeUndefined();

    expect(mockVehicleRepository.update).toHaveBeenCalledTimes(1);

    const updatedVehicle = mockVehicleRepository.update.mock.calls[0][0];
    expect(updatedVehicle.nombre).toBe("Coche nuevo");
  });

  // ======================================
  // HU12_E03 – Consumo inválido
  // ======================================
  test("HU12_E03 – Consumo negativo", async () => {
    await expect(
      vehicleService.updateVehicle(email, vehicleId, { consumo: -2 })
    ).rejects.toThrow("InvalidVehicleConsumptionError");

    expect(mockVehicleRepository.update).not.toHaveBeenCalled();
  });

  // ======================================
  // HU12_E04 – Usuario no autenticado
  // ======================================
  test("HU12_E04 – Usuario no autenticado", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      vehicleService.updateVehicle(email, vehicleId, { consumo: 5 })
    ).rejects.toThrow("AuthenticationRequiredError");

    expect(mockVehicleRepository.findByIdAndUser).not.toHaveBeenCalled();
  });

  // ======================================
  // HU12_E05 – Vehículo no existe
  // ======================================
  test("HU12_E05 – Vehículo no existe", async () => {
    mockVehicleRepository.findByIdAndUser.mockResolvedValue(null);

    await expect(
      vehicleService.updateVehicle(email, "vehiculo-inexistente", {
        consumo: 5,
      })
    ).rejects.toThrow("VehicleNotFoundError");
  });
});

import { Test } from "@nestjs/testing";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleRepository } from "../../../src/modules/vehicle/domain/vehicle.repository";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";

/**
 * ==========================
 * MOCKS
 * ==========================
 */

const userRepositoryMock = {
  findByEmail: jest.fn(),
};

const vehicleRepositoryMock = {
  findByIdAndUser: jest.fn(),
  delete: jest.fn(),
};

describe("HU11 – Borrado de vehículo (INTEGRATION)", () => {
  let vehicleService: VehicleService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, VehicleModule],
    })
      .overrideProvider(UserRepository)
      .useValue(userRepositoryMock)
      .overrideProvider(VehicleRepository)
      .useValue(vehicleRepositoryMock)
      .compile();

    vehicleService = moduleRef.get(VehicleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  // HU11_E01 – Borrado correcto
  // =====================================================
  test("HU11_E01 – Borra el vehículo del usuario", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "usuario@test.com",
    });

    vehicleRepositoryMock.findByIdAndUser.mockResolvedValue({
      id: "veh-1",
      nombre: "Coche",
    });

    vehicleRepositoryMock.delete.mockResolvedValue(undefined);

    await vehicleService.deleteVehicle("usuario@test.com", "veh-1");

    expect(userRepositoryMock.findByEmail).toHaveBeenCalledTimes(1);
    expect(vehicleRepositoryMock.findByIdAndUser).toHaveBeenCalledWith(
      "veh-1",
      "user-1"
    );
    expect(vehicleRepositoryMock.delete).toHaveBeenCalledWith("veh-1");
  });

  // =====================================================
  // HU11_E02 – Vehículo no existe
  // =====================================================
  test("HU11_E02 – Si el vehículo no existe lanza VehicleNotFoundError", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "usuario@test.com",
    });

    vehicleRepositoryMock.findByIdAndUser.mockResolvedValue(null);

    await expect(
      vehicleService.deleteVehicle("usuario@test.com", "vehiculo-inexistente")
    ).rejects.toThrow("VehicleNotFoundError");

    expect(vehicleRepositoryMock.delete).not.toHaveBeenCalled();
  });

  // =====================================================
  // HU11_E03 – Usuario no autenticado
  // =====================================================
  test("HU11_E03 – Usuario no autenticado lanza AuthenticationRequiredError", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    await expect(
      vehicleService.deleteVehicle("no-existe@test.com", "veh-1")
    ).rejects.toThrow("AuthenticationRequiredError");

    expect(vehicleRepositoryMock.findByIdAndUser).not.toHaveBeenCalled();
    expect(vehicleRepositoryMock.delete).not.toHaveBeenCalled();
  });

  // =====================================================
  // HU11_E04 – Error de BD
  // =====================================================
  test("HU11_E04 – Error de BD lanza DatabaseConnectionError", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "usuario@test.com",
    });

    vehicleRepositoryMock.findByIdAndUser.mockResolvedValue({
      id: "veh-1",
      nombre: "Coche",
    });

    vehicleRepositoryMock.delete.mockRejectedValue(new Error("DB error"));

    await expect(
      vehicleService.deleteVehicle("usuario@test.com", "veh-1")
    ).rejects.toThrow("DatabaseConnectionError");
  });
});

import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { VehicleRepository } from "../../../src/modules/vehicle/domain/vehicle.repository";
import { UserRepository } from ".../../../src/modules/user/domain/user.repository";
import { Vehicle } from "../../../src/modules/vehicle/domain/vehicle.entity";

import {
  AuthenticationRequiredError,
  VehicleNotFoundError,
} from "../../../src/modules/vehicle/domain/errors";

describe("HU20 – Marcar vehículo como favorito", () => {
  let service: VehicleService;
  let vehicleRepository: jest.Mocked<VehicleRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  const USER_EMAIL = "test@test.com";
  const USER_ID = "user-123";
  const VEHICLE_ID = "vehicle-123";

  beforeEach(() => {
    vehicleRepository = {
      save: jest.fn(),
      findByUser: jest.fn(),
      findByIdAndUser: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as any;

    userRepository = {
      findByEmail: jest.fn(),
    } as any;

    service = new VehicleService(vehicleRepository, userRepository);
  });

  // ==================================================
  // HU20_E01 – Marcar vehículo como favorito
  // ==================================================
  test("HU20_E01 – Marca vehículo como favorito", async () => {
    // GIVEN
    userRepository.findByEmail.mockResolvedValue({ id: USER_ID } as any);

    const vehicle = new Vehicle({
      id: VEHICLE_ID,
      nombre: "Coche",
      matricula: "1234ABC",
      tipo: "COMBUSTION",
      consumo: 5,
      favorito: false,
    });

    vehicleRepository.findByIdAndUser.mockResolvedValue(vehicle);

    // WHEN
    await service.toggleVehicleFavorite(USER_EMAIL, VEHICLE_ID);

    // THEN
    expect(vehicle.favorito).toBe(true);
    expect(vehicleRepository.update).toHaveBeenCalledWith(vehicle);
  });

  // ==================================================
  // HU20_E02 – Vehículo no existe
  // ==================================================
  test("HU20_E02 – Error si el vehículo no existe", async () => {
    // GIVEN
    userRepository.findByEmail.mockResolvedValue({ id: USER_ID } as any);
    vehicleRepository.findByIdAndUser.mockResolvedValue(null);

    // THEN
    await expect(
      service.toggleVehicleFavorite(USER_EMAIL, VEHICLE_ID)
    ).rejects.toBeInstanceOf(VehicleNotFoundError);
  });

  // ==================================================
  // HU20_E03 – Usuario no autenticado
  // ==================================================
  test("HU20_E03 – Error si el usuario no está autenticado", async () => {
    // GIVEN
    userRepository.findByEmail.mockResolvedValue(null);

    // THEN
    await expect(
      service.toggleVehicleFavorite(USER_EMAIL, VEHICLE_ID)
    ).rejects.toBeInstanceOf(AuthenticationRequiredError);
  });

  // ==================================================
  // HU20_E05 – Desmarcar vehículo favorito
  // ==================================================
  test("HU20_E05 – Desmarca un vehículo que ya era favorito", async () => {
    // GIVEN
    userRepository.findByEmail.mockResolvedValue({ id: USER_ID } as any);

    const vehicle = new Vehicle({
      id: VEHICLE_ID,
      nombre: "Coche",
      matricula: "5678DEF",
      tipo: "COMBUSTION",
      consumo: 6,
      favorito: true,
    });

    vehicleRepository.findByIdAndUser.mockResolvedValue(vehicle);

    // WHEN
    await service.toggleVehicleFavorite(USER_EMAIL, VEHICLE_ID);

    // THEN
    expect(vehicle.favorito).toBe(false);
    expect(vehicleRepository.update).toHaveBeenCalledTimes(1);
  });
});

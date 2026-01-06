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
  findById: jest.fn(),
};

const vehicleRepositoryMock = {
  findByUser: jest.fn(),
};

describe("HU10 – Listado de vehículos (INTEGRATION)", () => {
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
  // HU10_E01 – Usuario con vehículos
  // =====================================================
  test("HU10_E01 – Devuelve la lista de vehículos del usuario", async () => {
    userRepositoryMock.findById.mockResolvedValue({
      id: "user-1",
    });

    vehicleRepositoryMock.findByUser.mockResolvedValue([
      { id: "1", nombre: "Coche" },
      { id: "2", nombre: "Moto" },
    ]);

    const authUser = { id: "user-1" };

    const result = await vehicleService.listByUser(authUser);

    expect(result).toHaveLength(2);
    expect(vehicleRepositoryMock.findByUser).toHaveBeenCalledWith("user-1");
  });

  // =====================================================
  // HU10_E02 – Usuario sin vehículos
  // =====================================================
  test("HU10_E02 – Devuelve lista vacía si no hay vehículos", async () => {
    userRepositoryMock.findById.mockResolvedValue({
      id: "user-1",
    });

    vehicleRepositoryMock.findByUser.mockResolvedValue([]);

    const authUser = { id: "user-1" };

    const result = await vehicleService.listByUser(authUser);

    expect(result).toEqual([]);
  });

  // =====================================================
  // HU10_E03 – Usuario no autenticado (sin authUser)
  // =====================================================
  test("HU10_E03 – Lanza AuthenticationRequiredError si no hay authUser", async () => {
    await expect(
      vehicleService.listByUser(null as any)
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // =====================================================
  // HU10_E04 – Usuario inexistente
  // =====================================================
  test("HU10_E04 – Lanza AuthenticationRequiredError si el usuario no existe", async () => {
    userRepositoryMock.findById.mockResolvedValue(null);

    const authUser = { id: "user-1" };

    await expect(
      vehicleService.listByUser(authUser)
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

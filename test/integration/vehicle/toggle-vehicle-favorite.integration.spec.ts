import { Test, TestingModule } from "@nestjs/testing";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { VehicleRepository } from "../../../src/modules/vehicle/domain/vehicle.repository";
import { TEST_EMAIL } from "../../helpers/test-constants";

describe("HU20 – Marcar vehículo como favorito (Mocks)", () => {
  let vehicleService: VehicleService;
  
  const mockVehicleRepository = {
    findByIdAndUser: jest.fn(),
    update: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: VehicleRepository, useValue: mockVehicleRepository },
      ],
    }).compile();
    vehicleService = module.get<VehicleService>(VehicleService);
  });

  afterEach(() => jest.clearAllMocks());

  test("HU20_E01 – Debe marcar un vehículo como favorito", async () => {
    const mockVehicle = { id: "v-1", favorito: false };
    mockVehicleRepository.findByIdAndUser.mockResolvedValue(mockVehicle);

    await vehicleService.toggleVehicleFavorite(TEST_EMAIL, "v-1");

    expect(mockVehicleRepository.findByIdAndUser).toHaveBeenCalledWith("v-1", TEST_EMAIL);
    expect(mockVehicleRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ favorito: true })
    );
  });

  test("HU20_E02 – Error si el vehículo no existe", async () => {
    mockVehicleRepository.findByIdAndUser.mockResolvedValue(null);
    await expect(
      vehicleService.toggleVehicleFavorite(TEST_EMAIL, "id-falso")
    ).rejects.toThrow("VehicleNotFoundError");
  });
});
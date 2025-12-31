import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL} from "../../helpers/test-constants";

dotenv.config();

describe("HU09 – Alta de vehículo (ATDD)", () => {
  let vehicleService: VehicleService;
  let userService: UserService;

  // 🧹 Vehículos creados en cada test
  let vehicleIdsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, VehicleModule],
    }).compile();

    vehicleService = moduleRef.get(VehicleService);
    userService = moduleRef.get(UserService);

  });

  // ==================================================
  // Limpieza SOLO de los vehículos creados en el test
  // ==================================================
  afterEach(async () => {
    for (const vehicleId of vehicleIdsToDelete) {
      try {
        await vehicleService.delete(vehicleId);
      } catch {
      }
    }
    vehicleIdsToDelete = [];
  });

  // ======================================
  // HU09_E01 – Escenario válido
  // ======================================
  test("HU09_E01 – Alta de vehículo con datos válidos", async () => {
    const vehicle = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Coche familiar",
      "7750LHF",
      "COMBUSTION",
      6.5
    );

    vehicleIdsToDelete.push(vehicle.id);

    expect(vehicle).toBeDefined();
    expect(vehicle.nombre).toBe("Coche familiar");
    expect(vehicle.matricula).toBe("7750LHF");
    expect(vehicle.tipo).toBe("COMBUSTION");
    expect(vehicle.consumo).toBe(6.5);
    expect(vehicle.favorito).toBe(false);
  });

  // ======================================
  // HU09_E02 – Consumo inválido
  // ======================================
  test("HU09_E02 – Consumo negativo → error", async () => {
    await expect(
      vehicleService.createVehicle(
        TEST_EMAIL,
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

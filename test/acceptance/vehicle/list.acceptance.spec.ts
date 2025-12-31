import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";


dotenv.config();

describe("HU10 – Listado de vehículos (ATDD)", () => {
  let vehicleService: VehicleService;
  let userService: UserService;

  let vehicleIdsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, VehicleModule],
    }).compile();

    vehicleService = moduleRef.get(VehicleService);
    userService = moduleRef.get(UserService);

  });

  afterEach(async () => {
    for (const id of vehicleIdsToDelete) {
      try {
        await vehicleService.delete(id);
      } catch {}
    }
    vehicleIdsToDelete = [];
  });

  // ======================================
  // HU10_E01 – Listar vehículos del usuario
  // ======================================
  test("HU10_E01 – Listar vehículos del usuario", async () => {
    const v1 = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Coche",
      "1111AAA",
      "COMBUSTION",
      5
    );
    const v2 = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Moto",
      "2222BBB",
      "COMBUSTION",
      3
    );

    vehicleIdsToDelete.push(v1.id, v2.id);

    const vehicles = await vehicleService.listByUser(TEST_EMAIL);

    const nombres = vehicles.map(v => v.nombre);

    expect(nombres).toEqual(
      expect.arrayContaining(["Coche", "Moto"])
    );
  });

  // ======================================
  // HU10_E02 – Usuario no autenticado
  // ======================================
  test("HU10_E02 – Usuario no autenticado", async () => {
    await expect(
      vehicleService.listByUser("no-existe@test.com")
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

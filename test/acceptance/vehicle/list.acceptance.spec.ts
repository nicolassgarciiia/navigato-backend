import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";

describe("HU10 – Listado de vehículos (ATDD)", () => {
  let vehicleService: VehicleService;
  let userService: UserService;

  let vehicleIdsToDelete: string[] = [];
  let userId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, VehicleModule],
    }).compile();

    vehicleService = moduleRef.get(VehicleService);
    userService = moduleRef.get(UserService);

    // 🔐 asegurar usuario
    const user = await userService.findByEmail(TEST_EMAIL);
    if (!user) {
      await userService.register({
        nombre: "Usuario",
        apellidos: "Test ATDD",
        correo: TEST_EMAIL,
        contraseña: TEST_PASSWORD,
        repetirContraseña: TEST_PASSWORD,
        aceptaPoliticaPrivacidad: true,
      });
      const created = await userService.findByEmail(TEST_EMAIL);
      userId = created!.id;
    } else {
      userId = user.id;
    }
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
  // HU10_E01 – Listado con vehículos
  // ======================================
  test("HU10_E01 – Lista los vehículos del usuario", async () => {
    const v1 = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Coche 1",
      "AAA111",
      "COMBUSTION",
      6
    );
    const v2 = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Coche 2",
      "BBB222",
      "ELECTRICO",
      0
    );

    vehicleIdsToDelete.push(v1.id, v2.id);

    const vehicles = await vehicleService.listByUser({ id: userId });

    expect(vehicles.length).toBeGreaterThanOrEqual(2);
    expect(vehicles.map(v => v.id)).toEqual(
      expect.arrayContaining([v1.id, v2.id])
    );
  });

  // ======================================
  // HU10_E02 – Usuario no autenticado
  // ======================================
  test("HU10_E02 – Usuario no autenticado → error", async () => {
    await expect(
      vehicleService.listByUser(null)
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

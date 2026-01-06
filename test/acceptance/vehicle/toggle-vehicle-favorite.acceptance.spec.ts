import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import { VehicleNotFoundError } from "../../../src/modules/vehicle/domain/errors";
import * as dotenv from "dotenv";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";
import * as crypto from "crypto";

dotenv.config();

describe("HU20 – Marcar vehículo como favorito (ATDD)", () => {
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

    // 🔐 Asegurar usuario de test (UNA SOLA VEZ)
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

  // ==================================================
  // Limpieza SOLO de los vehículos creados en el test
  // ==================================================
  afterEach(async () => {
    for (const vehicleId of vehicleIdsToDelete) {
      try {
        await vehicleService.delete(vehicleId);
      } catch {
        // limpieza best-effort
      }
    }
    vehicleIdsToDelete = [];
  });

  // ======================================
  // HU20_E01 – Marca vehículo como favorito
  // ======================================
  test("HU20_E01 – Debe marcar un vehículo como favorito", async () => {
    const vehicle = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Coche favorito",
      "9999AAA",
      "COMBUSTION",
      6
    );
    vehicleIdsToDelete.push(vehicle.id);

    await vehicleService.toggleVehicleFavorite(TEST_EMAIL, vehicle.id);

    const vehicles = await vehicleService.listByUser({ id: userId });
    const updated = vehicles.find(v => v.id === vehicle.id);

    expect(updated).toBeDefined();
    expect(updated!.favorito).toBe(true);
  });

  // ======================================
  // HU20_E02 – Vehículo no existe
  // ======================================
  test("HU20_E02 – Debe lanzar error si el vehículo no existe", async () => {
    await expect(
      vehicleService.toggleVehicleFavorite(
        TEST_EMAIL,
        crypto.randomUUID()
      )
    ).rejects.toThrow(VehicleNotFoundError);
  });

  // ======================================
  // HU20_E03 – Usuario no autenticado
  // ======================================
  test("HU20_E03 – Debe lanzar error si el usuario no tiene sesión", async () => {
    await expect(
      vehicleService.toggleVehicleFavorite(
        "no-existe@test.com",
        crypto.randomUUID()
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // ======================================
  // HU20_E05 – Desmarca vehículo como favorito
  // ======================================
  test("HU20_E05 – Debe desmarcar un vehículo que ya era favorito", async () => {
    const vehicle = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Coche toggle",
      "8888BBB",
      "COMBUSTION",
      5
    );
    vehicleIdsToDelete.push(vehicle.id);

    await vehicleService.toggleVehicleFavorite(TEST_EMAIL, vehicle.id); // true
    await vehicleService.toggleVehicleFavorite(TEST_EMAIL, vehicle.id); // false

    const vehicles = await vehicleService.listByUser({ id: userId });
    const updated = vehicles.find(v => v.id === vehicle.id);

    expect(updated).toBeDefined();
    expect(updated!.favorito).toBe(false);
  });
});

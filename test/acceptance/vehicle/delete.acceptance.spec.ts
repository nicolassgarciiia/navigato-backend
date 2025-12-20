import { Test } from "@nestjs/testing";
import { AppModule } from "../../../src/app.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import { Vehicle } from "../../../src/modules/vehicle/domain/vehicle.entity";
import { VehicleNotFoundError } from "../../../src/modules/vehicle/domain/errors";
import * as dotenv from "dotenv";

dotenv.config();

const TEST_USER_EMAIL = `hu11_user_${Date.now()}@test.com`;
const VEHICLE_NAME_1 = `Vehículo a borrar ${Date.now()}`;
const VEHICLE_NAME_2 = `Vehículo respaldo ${Date.now()}`;

describe("HU11 – Borrado de vehículo (ATDD)", () => {
  let vehicleService: VehicleService;
  let userService: UserService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    vehicleService = moduleRef.get(VehicleService);
    userService = moduleRef.get(UserService);

    await userService.register({
      nombre: "Test",
      apellidos: "Vehicle",
      correo: TEST_USER_EMAIL,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });
  });

  afterAll(async () => {
    try {
      await userService.deleteAccount(TEST_USER_EMAIL);
    } catch {
      // ignore
    }
  });

  // ======================================================
  // HU11_E01 – Eliminación exitosa
  // ======================================================
  test("HU11_E01 – Eliminación exitosa del vehículo", async () => {
    const vehicleToDelete: Vehicle = await vehicleService.createVehicle(
      TEST_USER_EMAIL,
      VEHICLE_NAME_1,
      "1234ABC",
      "COMBUSTION",
      6.5
    );

    const backupVehicle: Vehicle = await vehicleService.createVehicle(
      TEST_USER_EMAIL,
      VEHICLE_NAME_2,
      "5678DEF",
      "COMBUSTION",
      5.2
    );

    await vehicleService.deleteVehicle(TEST_USER_EMAIL, vehicleToDelete.id);

    const vehiclesAfterDeletion =
      await vehicleService.listByUser(TEST_USER_EMAIL);

    expect(
      vehiclesAfterDeletion.find((v) => v.id === vehicleToDelete.id)
    ).toBeUndefined();

    expect(
      vehiclesAfterDeletion.find((v) => v.id === backupVehicle.id)
    ).toBeDefined();

    // cleanup del vehículo de respaldo
    await vehicleService.deleteVehicle(TEST_USER_EMAIL, backupVehicle.id);
  });

  // ======================================================
  // HU11_E02 – Vehículo no existe
  // ======================================================
  test("HU11_E02 – Vehículo no existe o ya fue eliminado", async () => {
    await expect(
      vehicleService.deleteVehicle(
        TEST_USER_EMAIL,
        crypto.randomUUID()
      )
    ).rejects.toThrow(VehicleNotFoundError);
  });

  // ======================================================
  // HU11_E03 – Usuario no autenticado
  // ======================================================
  test("HU11_E03 – Intento de borrado con usuario no registrado", async () => {
    const email = `no_registrado_${Date.now()}@test.com`;

    await expect(
      vehicleService.deleteVehicle(email, crypto.randomUUID())
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

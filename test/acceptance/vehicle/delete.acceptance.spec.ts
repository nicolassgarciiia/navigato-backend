import { Test } from "@nestjs/testing";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import { VehicleNotFoundError } from "../../../src/modules/vehicle/domain/errors";
import * as dotenv from "dotenv";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";
import * as crypto from "crypto";

dotenv.config();

describe("HU11 – Borrado de vehículo (ATDD)", () => {
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

  // ======================================================
  // HU11_E01 – Eliminación exitosa
  // ======================================================
  test("HU11_E01 – Eliminación exitosa del vehículo", async () => {
    const vehicleToDelete = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Vehículo a borrar",
      "1234ABC",
      "COMBUSTION",
      6.5
    );
    vehicleIdsToDelete.push(vehicleToDelete.id);

    const backupVehicle = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Vehículo respaldo",
      "5678DEF",
      "COMBUSTION",
      5.2
    );
    vehicleIdsToDelete.push(backupVehicle.id);

    // ACT
    await vehicleService.deleteVehicle(TEST_EMAIL, vehicleToDelete.id);

    // evitar doble borrado en afterEach
    vehicleIdsToDelete = vehicleIdsToDelete.filter(
      (id) => id !== vehicleToDelete.id
    );

    // ASSERT
    const vehiclesAfterDeletion =
      await vehicleService.listByUser({ id: userId });

    expect(
      vehiclesAfterDeletion.find((v) => v.id === vehicleToDelete.id)
    ).toBeUndefined();

    expect(
      vehiclesAfterDeletion.find((v) => v.id === backupVehicle.id)
    ).toBeDefined();
  });

  // ======================================================
  // HU11_E02 – Vehículo no existe
  // ======================================================
  test("HU11_E02 – Vehículo no existe o ya fue eliminado", async () => {
    await expect(
      vehicleService.deleteVehicle(
        TEST_EMAIL,
        crypto.randomUUID()
      )
    ).rejects.toThrow(VehicleNotFoundError);
  });

  // ======================================================
  // HU11_E03 – Usuario no autenticado
  // ======================================================
  test("HU11_E03 – Intento de borrado con usuario no registrado", async () => {
    await expect(
      vehicleService.deleteVehicle(
        "no_registrado@test.com",
        crypto.randomUUID()
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

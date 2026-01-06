import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";
import * as crypto from "crypto";

dotenv.config();

describe("HU12 – Modificar vehículo (ATDD)", () => {
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
    for (const id of vehicleIdsToDelete) {
      try {
        await vehicleService.delete(id);
      } catch {
        // limpieza best-effort
      }
    }
    vehicleIdsToDelete = [];
  });

  // ======================================
  // HU12_E01 – Modificar consumo
  // ======================================
  test("HU12_E01 – Modificar consumo de vehículo", async () => {
    const vehicle = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Coche inicial",
      "1234ABC",
      "COMBUSTION",
      6.5
    );
    vehicleIdsToDelete.push(vehicle.id);

    await expect(
      vehicleService.updateVehicle(TEST_EMAIL, vehicle.id, { consumo: 5.4 })
    ).resolves.toBeUndefined();

    const vehicles = await vehicleService.listByUser({ id: userId });
    const updated = vehicles.find((v) => v.id === vehicle.id);

    expect(updated).toBeDefined();
    expect(updated!.consumo).toBe(5.4);
  });

  // ======================================
  // HU12_E02 – Modificar nombre
  // ======================================
  test("HU12_E02 – Modificar nombre del vehículo", async () => {
    const vehicle = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Coche inicial",
      "5678DEF",
      "COMBUSTION",
      6.5
    );
    vehicleIdsToDelete.push(vehicle.id);

    await expect(
      vehicleService.updateVehicle(
        TEST_EMAIL,
        vehicle.id,
        { nombre: "Coche nuevo" }
      )
    ).resolves.toBeUndefined();

    const vehicles = await vehicleService.listByUser({ id: userId });
    const updated = vehicles.find((v) => v.id === vehicle.id);

    expect(updated).toBeDefined();
    expect(updated!.nombre).toBe("Coche nuevo");
  });

  // ======================================
  // HU12_E03 – Consumo inválido
  // ======================================
  test("HU12_E03 – Consumo negativo → error", async () => {
    const vehicle = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Coche",
      "9999ZZZ",
      "COMBUSTION",
      6.5
    );
    vehicleIdsToDelete.push(vehicle.id);

    await expect(
      vehicleService.updateVehicle(TEST_EMAIL, vehicle.id, { consumo: -3 })
    ).rejects.toThrow("InvalidVehicleConsumptionError");
  });

  // ======================================
  // HU12_E04 – Usuario no autenticado
  // ======================================
  test("HU12_E04 – Usuario no autenticado", async () => {
    await expect(
      vehicleService.updateVehicle(
        "no-existe@test.com",
        crypto.randomUUID(),
        { consumo: 5 }
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // ======================================
  // HU12_E05 – Vehículo no existe
  // ======================================
  test("HU12_E05 – Vehículo no existe", async () => {
    await expect(
      vehicleService.updateVehicle(
        TEST_EMAIL,
        crypto.randomUUID(),
        { consumo: 5 }
      )
    ).rejects.toThrow("VehicleNotFoundError");
  });
});

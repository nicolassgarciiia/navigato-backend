import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL } from "../../helpers/test-constants";

dotenv.config();

describe("HU20 – Marcar vehículo como favorito (ATDD)", () => {
  let vehicleService: VehicleService;

  // 🧹 Vehículos creados en cada test
  let vehicleIdsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, VehicleModule],
    }).compile();

    vehicleService = moduleRef.get(VehicleService);
  });

  // Limpieza de datos
  afterEach(async () => {
    for (const vehicleId of vehicleIdsToDelete) {
      try {
        await vehicleService.delete(vehicleId);
      } catch {}
    }
    vehicleIdsToDelete = [];
  });

  // ======================================
  // HU20_E01 – Marca vehículo como favorito
  // ======================================
  test("HU20_E01 – Debe marcar un vehículo como favorito", async () => {
    // GIVEN: Un vehículo creado para el usuario
    const vehicle = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Coche favorito",
      "9999AAA",
      "COMBUSTION",
      6
    );
    vehicleIdsToDelete.push(vehicle.id);

    // WHEN: Se marca como favorito
    await vehicleService.toggleVehicleFavorite(TEST_EMAIL, vehicle.id);

    // THEN: El estado debe ser favorito = true
    const vehicles = await vehicleService.listByUser(TEST_EMAIL);
    const updated = vehicles.find(v => v.id === vehicle.id);

    expect(updated).toBeDefined();
    expect(updated!.favorito).toBe(true);
  });

  // ======================================
  // HU20_E02 – Vehículo no existe
  // ======================================
  test("HU20_E02 – Debe lanzar error si el vehículo no existe", async () => {
    const idFalso = "00000000-0000-0000-0000-000000000000";
    
    await expect(
      vehicleService.toggleVehicleFavorite(TEST_EMAIL, idFalso)
    ).rejects.toThrow("VehicleNotFoundError"); 
    // Nota: Asegúrate de que este nombre de error coincida con tu lógica
  });

  // ======================================
  // HU20_E03 – Usuario no autenticado
  // ======================================
  test("HU20_E03 – Debe lanzar error si el usuario no tiene sesión", async () => {
    await expect(
      vehicleService.toggleVehicleFavorite("no-existe@test.com", "any-id")
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // ======================================
  // HU20_E05 – Desmarca vehículo como favorito
  // ======================================
  test("HU20_E05 – Debe desmarcar un vehículo que ya era favorito", async () => {
    // GIVEN: Un vehículo que ya es favorito
    const vehicle = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Coche toggle",
      "8888BBB",
      "COMBUSTION",
      5
    );
    vehicleIdsToDelete.push(vehicle.id);

    await vehicleService.toggleVehicleFavorite(TEST_EMAIL, vehicle.id); // Toggle 1: true

    // WHEN: Volvemos a hacer toggle
    await vehicleService.toggleVehicleFavorite(TEST_EMAIL, vehicle.id); // Toggle 2: false

    // THEN: El estado debe ser favorito = false
    const vehicles = await vehicleService.listByUser(TEST_EMAIL);
    const updated = vehicles.find(v => v.id === vehicle.id);

    expect(updated!.favorito).toBe(false);
  });
});
import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU14 – Calcular coste de ruta en vehículo (ATDD)", () => {
  let vehicleService: VehicleService;
  let routeService: RouteService;
  let poiService: POIService;
  let userService: UserService;

  let vehicleIdsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule, VehicleModule, RouteModule],
    }).compile();

    vehicleService = moduleRef.get(VehicleService);
    routeService = moduleRef.get(RouteService);
    poiService = moduleRef.get(POIService);
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
    }
  });

  // ==================================================
  // Limpieza SOLO de vehículos creados en el test
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
  // HU14_E01 – Escenario válido
  // ======================================
  test("HU14_E01 – Calcula el coste de combustible de una ruta", async () => {
    const vehicleName = `Coche-${randomUUID()}`;

    const origen = { lat: 39.9869, lng: -0.0513 };
    const destino = { lat: 40.4168, lng: -3.7038 };

    const vehicle = await vehicleService.createVehicle(
      TEST_EMAIL,
      vehicleName,
      `MAT-${randomUUID().slice(0, 6)}`,
      "COMBUSTION",
      6.5
    );
    vehicleIdsToDelete.push(vehicle.id);

    await routeService.calculateRoute(
      TEST_EMAIL,
      origen,
      destino,
      "vehiculo"
    );

    const cost = await routeService.calculateRouteCostWithVehicle(
      TEST_EMAIL,
      vehicleName
    );

    expect(cost).toBeDefined();
    expect(cost.tipo).toBe("combustible");
    expect(cost.costeEconomico).toBeGreaterThan(0);
    expect(cost.costeEnergetico.valor).toBeGreaterThan(0);
  });
});

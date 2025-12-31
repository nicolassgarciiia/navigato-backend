import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { TEST_EMAIL } from "../../helpers/test-constants";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU14 – Calcular coste de ruta en vehículo (ATDD)", () => {
  let vehicleService: VehicleService;
  let routeService: RouteService;
  let poiService: POIService;

  let poiIdsToDelete: string[] = [];
  let vehicleIdsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule, VehicleModule, RouteModule],
    }).compile();

    vehicleService = moduleRef.get(VehicleService);
    routeService = moduleRef.get(RouteService);
    poiService = moduleRef.get(POIService);
  });

  // ======================================
  // Limpieza SOLO de datos creados en el test
  // ======================================
  afterEach(async () => {
    for (const poiId of poiIdsToDelete) {
      try {
        await poiService.delete(poiId);
      } catch {}
    }
    for (const vehicleId of vehicleIdsToDelete) {
      try {
        await vehicleService.delete(vehicleId);
      } catch {}
    }

    poiIdsToDelete = [];
    vehicleIdsToDelete = [];
  });

  // ======================================
  // HU14_E01 – Escenario válido
  // ======================================
  test("HU14_E01 – Calcula el coste de combustible de una ruta", async () => {
    const origenName = `Casa-${randomUUID()}`;
    const destinoName = `Trabajo-${randomUUID()}`;
    const vehicleName = `Coche-${randomUUID()}`;

    // POIs
    const origen = await poiService.createPOI(
      TEST_EMAIL,
      origenName,
      39.9869,
      -0.0513
    );
    const destino = await poiService.createPOI(
      TEST_EMAIL,
      destinoName,
      40.4168,
      -3.7038
    );
    poiIdsToDelete.push(origen.id, destino.id);

    // Vehículo
    const vehicle = await vehicleService.createVehicle(
      TEST_EMAIL,
      vehicleName,
      `MAT-${randomUUID().slice(0, 6)}`,
      "COMBUSTION",
      6.5
    );
    vehicleIdsToDelete.push(vehicle.id);

    // Ruta
    await routeService.calculateRoute(
      TEST_EMAIL,
      origenName,
      destinoName,
      "vehiculo"
    );

    // Coste
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

import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { TEST_EMAIL } from "../../helpers/test-constants";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU16 – Calcular ruta según criterio (ATDD)", () => {
  let poiService: POIService;
  let routeService: RouteService;

  let poiIdsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule, RouteModule],
    }).compile();

    poiService = moduleRef.get(POIService);
    routeService = moduleRef.get(RouteService);
  });

  // ======================================
  // Limpieza SOLO de POIs creados en el test
  // ======================================
  afterEach(async () => {
    for (const poiId of poiIdsToDelete) {
      try {
        await poiService.delete(poiId);
      } catch {}
    }
    poiIdsToDelete = [];
  });

  // ======================================
  // HU16_E01 – Ruta más rápida
  // ======================================
  test("HU16_E01 – Calcula la ruta más rápida", async () => {
    const origenName = `Casa-${randomUUID()}`;
    const destinoName = `Trabajo-${randomUUID()}`;

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

    const route = await routeService.calculateRouteByType(
      TEST_EMAIL,
      origenName,
      destinoName,
      "vehiculo",
      "rapida"
    );

    expect(route).toBeDefined();
    expect(route.tipo).toBe("rapida");
  });

  // ======================================
  // HU16_E02 – Ruta más corta
  // ======================================
  test("HU16_E02 – Calcula la ruta más corta", async () => {
    const origenName = `Casa-${randomUUID()}`;
    const destinoName = `Trabajo-${randomUUID()}`;

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

    const route = await routeService.calculateRouteByType(
      TEST_EMAIL,
      origenName,
      destinoName,
      "vehiculo",
      "corta"
    );

    expect(route).toBeDefined();
    expect(route.tipo).toBe("corta");
  });

  // ======================================
  // HU16_E03 – Ruta más económica
  // ======================================
  test("HU16_E03 – Calcula la ruta más económica", async () => {
    const origenName = `Casa-${randomUUID()}`;
    const destinoName = `Trabajo-${randomUUID()}`;

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

    const route = await routeService.calculateRouteByType(
      TEST_EMAIL,
      origenName,
      destinoName,
      "vehiculo",
      "economica"
    );

    expect(route).toBeDefined();
    expect(route.tipo).toBe("economica");
  });
});

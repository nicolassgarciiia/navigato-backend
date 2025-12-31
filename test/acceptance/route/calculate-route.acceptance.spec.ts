import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { TEST_EMAIL } from "../../helpers/test-constants";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU13 – Calcular ruta entre dos lugares (ATDD)", () => {
  let routeService: RouteService;
  let poiService: POIService;

  let poiIdsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule, RouteModule],
    }).compile();

    routeService = moduleRef.get(RouteService);
    poiService = moduleRef.get(POIService);
  });

  // ======================================
  // Limpieza SOLO de POIs creados en el test
  // ======================================
  afterEach(async () => {
    for (const poiId of poiIdsToDelete) {
      try {
        await poiService.delete(poiId);
      } catch {
        // ignorar
      }
    }
    poiIdsToDelete = [];
  });

  // ======================================
  // HU13_E01 – Escenario válido
  // ======================================
  test("HU13_E01 – Calcula una ruta válida entre dos lugares", async () => {
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

    const route = await routeService.calculateRoute(
      TEST_EMAIL,
      origenName,
      destinoName,
      "vehiculo"
    );

    expect(route).toBeDefined();
    expect(route.origen.nombre).toBe(origenName);
    expect(route.destino.nombre).toBe(destinoName);
    expect(route.distancia).toBeGreaterThan(0);
    expect(route.duracion).toBeGreaterThan(0);
  });

  // ======================================
  // HU13_E02 – Lugar inválido
  // ======================================
  test("HU13_E02 – Lugar inexistente", async () => {
    const origenName = `Casa-${randomUUID()}`;

    const origen = await poiService.createPOI(
      TEST_EMAIL,
      origenName,
      39.9869,
      -0.0513
    );
    poiIdsToDelete.push(origen.id);

    await expect(
      routeService.calculateRoute(
        TEST_EMAIL,
        origenName,
        "Lugar-Que-No-Existe",
        "vehiculo"
      )
    ).rejects.toThrow("InvalidPlaceOfInterestError");
  });

  // ======================================
  // HU13_E03 – Usuario no autenticado
  // ======================================
  test("HU13_E03 – Usuario no autenticado", async () => {
    await expect(
      routeService.calculateRoute(
        "no-existe@test.com",
        "Casa",
        "Trabajo",
        "vehiculo"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

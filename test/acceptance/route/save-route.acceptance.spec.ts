import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL } from "../../helpers/test-constants";
import { randomUUID } from "crypto";

dotenv.config();

describe("HU17 – Guardar ruta (ATDD)", () => {
  let userService: UserService;
  let poiService: POIService;
  let routeService: RouteService;

  let poiIdsToDelete: string[] = [];
  let savedRouteNamesToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule, RouteModule],
    }).compile();

    userService = moduleRef.get(UserService);
    poiService = moduleRef.get(POIService);
    routeService = moduleRef.get(RouteService);
  });

  // ==================================================
  // Limpieza SOLO de lo creado en cada test
  // ==================================================
  afterEach(async () => {
    for (const routeName of savedRouteNamesToDelete) {
      try {
        await routeService.delete(TEST_EMAIL, routeName);
      } catch {}
    }

    for (const poiId of poiIdsToDelete) {
      try {
        await poiService.delete(poiId);
      } catch {}
    }

    savedRouteNamesToDelete = [];
    poiIdsToDelete = [];
  });

  // ======================================
  // HU17_E01 – Escenario válido
  // ======================================
  test("HU17_E01 – Guarda una ruta calculada correctamente", async () => {
    const casaName = `Casa HU17 ${randomUUID()}`;
    const trabajoName = `Trabajo HU17 ${randomUUID()}`;

    const casa = await poiService.createPOI(
      TEST_EMAIL,
      casaName,
      39.9869,
      -0.0513
    );

    const trabajo = await poiService.createPOI(
      TEST_EMAIL,
      trabajoName,
      40.4168,
      -3.7038
    );

    poiIdsToDelete.push(casa.id, trabajo.id);

    // 🔴 CAMBIO CLAVE: usar coordenadas
    await routeService.calculateRoute(
      TEST_EMAIL,
      { lat: casa.latitud, lng: casa.longitud },
      { lat: trabajo.latitud, lng: trabajo.longitud },
      "vehiculo"
    );

    const saved = await routeService.saveRoute(
      TEST_EMAIL,
      "Ruta al trabajo HU17"
    );

    savedRouteNamesToDelete.push("Ruta al trabajo HU17");

    expect(saved).toBeDefined();
    expect(saved.nombre).toBe("Ruta al trabajo HU17");
  });

  // ======================================
  // HU17_E02 – Ruta no calculada
  // ======================================
  test("HU17_E02 – No se puede guardar una ruta si no se ha calculado previamente", async () => {
    await expect(
      routeService.saveRoute(
        TEST_EMAIL,
        "Ruta inexistente HU17"
      )
    ).rejects.toThrow("RouteNotCalculatedError");
  });
});

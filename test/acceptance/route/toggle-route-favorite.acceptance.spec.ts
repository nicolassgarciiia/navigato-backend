import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { RouteService } from "../../../src/modules/route/application/route.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL } from "../../helpers/test-constants";

dotenv.config();

describe("ROUTE – ATDD / Integration", () => {
  let userService: UserService;
  let poiService: POIService;
  let routeService: RouteService;

  let poiIdsToDelete: string[] = [];
  let savedRouteNamesToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule, VehicleModule, RouteModule],
    }).compile();

    userService = moduleRef.get(UserService);
    poiService = moduleRef.get(POIService);
    routeService = moduleRef.get(RouteService);

  });

  afterEach(async () => {
    for (const name of savedRouteNamesToDelete) {
      try {
        await routeService.deleteSavedRoute(TEST_EMAIL, name);
      } catch {}
    }
    savedRouteNamesToDelete = [];

    for (const id of poiIdsToDelete) {
      try {
        await poiService.deletePOI(TEST_EMAIL, id);
      } catch {}
    }
    poiIdsToDelete = [];
  });

  // ======================================================
  // HU13 – Calcular ruta
  // ======================================================
  test("HU13_E01 – Calcula ruta entre dos POIs", async () => {
    const origen = await poiService.createPOI(TEST_EMAIL, "R_ORIGEN", 41.38, 2.17);
    const destino = await poiService.createPOI(TEST_EMAIL, "R_DESTINO", 41.39, 2.18);
    poiIdsToDelete.push(origen.id, destino.id);

    const route = await routeService.calculateRoute(
      TEST_EMAIL,
      "R_ORIGEN",
      "R_DESTINO",
      "car"
    );

    expect(route).toBeDefined();
    expect(route.distancia).toBeDefined();
  });

  // ======================================================
  // HU17 – Guardar ruta
  // ======================================================
  test("HU17_E01 – Guarda la última ruta calculada", async () => {
    const origen = await poiService.createPOI(TEST_EMAIL, "S_ORIGEN", 41.40, 2.19);
    const destino = await poiService.createPOI(TEST_EMAIL, "S_DESTINO", 41.41, 2.20);
    poiIdsToDelete.push(origen.id, destino.id);

    await routeService.calculateRoute(
      TEST_EMAIL,
      "S_ORIGEN",
      "S_DESTINO",
      "car"
    );

    const saved = await routeService.saveRoute(TEST_EMAIL, "Ruta Casa-Trabajo");
    savedRouteNamesToDelete.push(saved.nombre);

    expect(saved).toBeDefined();
    expect(saved.nombre).toBe("Ruta Casa-Trabajo");
  });

  test("HU17_E02 – Error si no hay ruta calculada", async () => {
    await expect(
      routeService.saveRoute(TEST_EMAIL, "Sin ruta")
    ).rejects.toThrow("RouteNotCalculatedError");
  });

  // ======================================================
  // HU18 – Listar rutas guardadas
  // ======================================================
  test("HU18_E01 – Lista rutas guardadas", async () => {
    const origen = await poiService.createPOI(TEST_EMAIL, "L_ORIGEN", 41.42, 2.21);
    const destino = await poiService.createPOI(TEST_EMAIL, "L_DESTINO", 41.43, 2.22);
    poiIdsToDelete.push(origen.id, destino.id);

    await routeService.calculateRoute(
      TEST_EMAIL,
      "L_ORIGEN",
      "L_DESTINO",
      "car"
    );

    const saved = await routeService.saveRoute(TEST_EMAIL, "Ruta Lista");
    savedRouteNamesToDelete.push(saved.nombre);

    const routes = await routeService.listSavedRoutes(TEST_EMAIL);

    expect(routes.some(r => r.nombre === "Ruta Lista")).toBe(true);
  });

  // ======================================================
  // HU19 – Eliminar ruta guardada
  // ======================================================
  test("HU19_E01 – Elimina ruta guardada", async () => {
    const origen = await poiService.createPOI(TEST_EMAIL, "D_ORIGEN", 41.44, 2.23);
    const destino = await poiService.createPOI(TEST_EMAIL, "D_DESTINO", 41.45, 2.24);
    poiIdsToDelete.push(origen.id, destino.id);

    await routeService.calculateRoute(
      TEST_EMAIL,
      "D_ORIGEN",
      "D_DESTINO",
      "car"
    );

    const saved = await routeService.saveRoute(TEST_EMAIL, "Ruta Borrar");
    await routeService.deleteSavedRoute(TEST_EMAIL, saved.nombre);

    const routes = await routeService.listSavedRoutes(TEST_EMAIL);
    expect(routes.find(r => r.nombre === saved.nombre)).toBeUndefined();
  });
});

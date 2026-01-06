import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU18 – Lista rutas guardadas (ATDD)", () => {
  let userService: UserService;
  let poiService: POIService;
  let routeService: RouteService;

  let poiIdsToDelete: string[] = [];

  const ROUTE_NAME = "Ruta HU18";

  // ======================================
  // SETUP
  // ======================================
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule, RouteModule],
    }).compile();

    userService = moduleRef.get(UserService);
    poiService = moduleRef.get(POIService);
    routeService = moduleRef.get(RouteService);

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

    // Crear POIs necesarios
    const origen = await poiService.createPOI(
      TEST_EMAIL,
      "Casa HU18",
      39.9869,
      -0.0513
    );

    const destino = await poiService.createPOI(
      TEST_EMAIL,
      "Trabajo HU18",
      40.4168,
      -3.7038
    );

    poiIdsToDelete.push(origen.id, destino.id);

    // Calcular y guardar ruta
    await routeService.calculateRoute(
      TEST_EMAIL,
      { lat: origen.latitud, lng: origen.longitud },
      { lat: destino.latitud, lng: destino.longitud },
      "vehiculo"
    );

    await routeService.saveRoute(TEST_EMAIL, ROUTE_NAME);
  });

  // ======================================
  // LIMPIEZA
  // ======================================
  afterAll(async () => {
    // Limpiar POIs creados
    for (const poiId of poiIdsToDelete) {
      try {
        await poiService.delete(poiId);
      } catch {}
    }

    // Limpiar ruta si quedó (best-effort)
    try {
      await routeService.delete(TEST_EMAIL, ROUTE_NAME);
    } catch {}
  });

  // ======================================
  // HU18_E01 – Escenario válido
  // ======================================
  test("HU18_E01 – Lista las rutas guardadas del usuario", async () => {
    const routes = await routeService.listSavedRoutes(TEST_EMAIL);

    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);

    const route = routes.find(r => r.nombre === ROUTE_NAME);
    expect(route).toBeDefined();
    expect(route?.favorito).toBe(false);
    expect(route?.fechaGuardado).toBeDefined();
  });

  // ======================================
  // HU18_E02 – Escenario inválido
  // ======================================
  test("HU18_E02 – No se pueden listar rutas sin sesión iniciada", async () => {
    await expect(
      routeService.listSavedRoutes("no-existe@test.com")
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

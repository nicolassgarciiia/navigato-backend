import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU13 – Calcular ruta entre dos lugares (ATDD)", () => {
  let routeService: RouteService;
  let poiService: POIService;
  let userService: UserService;

  let poiIdsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule, RouteModule],
    }).compile();

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

  // ======================================
  // Limpieza SOLO de POIs creados en el test
  // ======================================
  afterEach(async () => {
    for (const poiId of poiIdsToDelete) {
      try {
        await poiService.delete(poiId);
      } catch {
        // limpieza best-effort
      }
    }
    poiIdsToDelete = [];
  });

  // ======================================
  // HU13_E01 – Escenario válido
  // ======================================
  test("HU13_E01 – Calcula una ruta válida entre dos lugares", async () => {
    const origen = await poiService.createPOI(
      TEST_EMAIL,
      `Casa-${randomUUID()}`,
      39.9869,
      -0.0513
    );

    const destino = await poiService.createPOI(
      TEST_EMAIL,
      `Trabajo-${randomUUID()}`,
      40.4168,
      -3.7038
    );

    poiIdsToDelete.push(origen.id, destino.id);

    const route = await routeService.calculateRoute(
      TEST_EMAIL,
      { lat: origen.latitud, lng: origen.longitud },
      { lat: destino.latitud, lng: destino.longitud },
      "vehiculo"
    );

    expect(route).toBeDefined();
    expect(route.distancia).toBeGreaterThan(0);
    expect(route.duracion).toBeGreaterThan(0);
    expect(route.origen.lat).toBe(origen.latitud);
    expect(route.destino.lng).toBe(destino.longitud);
  });

  // ======================================
  // HU13_E02 – Coordenadas inválidas
  // ======================================
  test("HU13_E02 – Coordenadas inválidas", async () => {
    await expect(
      routeService.calculateRoute(
        TEST_EMAIL,
        { lat: 999, lng: 999 },
        { lat: 40, lng: -3 },
        "vehiculo"
      )
    ).rejects.toBeDefined();
  });

  // ======================================
  // HU13_E03 – Usuario no autenticado
  // ======================================
  test("HU13_E03 – Usuario no autenticado", async () => {
    await expect(
      routeService.calculateRoute(
        "no-existe@test.com",
        { lat: 39, lng: -0.05 },
        { lat: 40, lng: -3 },
        "vehiculo"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

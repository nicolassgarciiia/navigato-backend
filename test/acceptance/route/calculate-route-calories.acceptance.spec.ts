import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU15 – Calcular coste calórico de una ruta (ATDD)", () => {
  let poiService: POIService;
  let routeService: RouteService;
  let userService: UserService;

  let poiIdsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule, RouteModule],
    }).compile();

    poiService = moduleRef.get(POIService);
    routeService = moduleRef.get(RouteService);
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
  // HU15_E01 – Escenario válido
  // ======================================
  test("HU15_E01 – Calcula el coste calórico de una ruta", async () => {
    const origenName = `Casa-${randomUUID()}`;
    const destinoName = `Parque-${randomUUID()}`;

    const origen = await poiService.createPOI(
      TEST_EMAIL,
      origenName,
      39.9869,
      -0.0513
    );

    const destino = await poiService.createPOI(
      TEST_EMAIL,
      destinoName,
      39.9875,
      -0.0521
    );

    poiIdsToDelete.push(origen.id, destino.id);

    await routeService.calculateRoute(
      TEST_EMAIL,
      { lat: origen.latitud, lng: origen.longitud },
      { lat: destino.latitud, lng: destino.longitud },
      "pie"
    );

    const cost = await routeService.calculateRouteCalories(TEST_EMAIL);

    expect(cost).toBeDefined();
    expect(cost.tipo).toBe("calorias");
    expect(cost.costeEnergetico.valor).toBeGreaterThan(0);
    expect(cost.costeEnergetico.unidad).toBe("kcal");
    expect(cost.costeEconomico).toBeNull();
  });
});

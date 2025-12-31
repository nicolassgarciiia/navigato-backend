import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { RouteService } from "../../../src/modules/route/application/route.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL } from "../../helpers/test-constants";

dotenv.config();

describe("HU17 – Guardar ruta (ATDD)", () => {
  let userService: UserService;
  let poiService: POIService;
  let routeService: RouteService;

  let routeNamesToDelete: string[] = [];

  // ======================================
  // SETUP SOLO DE SERVICIOS
  // ======================================
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule, RouteModule],
    }).compile();

    userService = moduleRef.get(UserService);
    poiService = moduleRef.get(POIService);
    routeService = moduleRef.get(RouteService);
  });

  // ==================================================
  // Limpieza: SOLO las rutas creadas en el test
  // ==================================================
  afterEach(async () => {
    for (const routeName of routeNamesToDelete) {
      try {
        await routeService.delete(TEST_EMAIL, routeName);
      } catch {
        // ignoramos si ya fue borrada
      }
    }
    routeNamesToDelete = [];
  });

  // =====================================================
  // HU17_E01 – Guarda una ruta correctamente
  // =====================================================
  test("HU17_E01 – Guarda una ruta calculada correctamente", async () => {
    // Arrange
    await poiService.createPOI(TEST_EMAIL, "Casa HU17", 39.9869, -0.0513);
    await poiService.createPOI(TEST_EMAIL, "Trabajo HU17", 40.4168, -3.7038);

    await routeService.calculateRoute(
      TEST_EMAIL,
      "Casa HU17",
      "Trabajo HU17",
      "vehiculo"
    );

    // Act
    const saved = await routeService.saveRoute(
      TEST_EMAIL,
      "Ruta al trabajo HU17"
    );

    routeNamesToDelete.push(saved.nombre);

    // Assert
    expect(saved).toBeDefined();
    expect(saved.nombre).toBe("Ruta al trabajo HU17");
    expect(saved.favorito).toBe(false);
    expect(saved.fechaGuardado).toBeDefined();
  });

  // =====================================================
  // HU17_E02 – Ruta no calculada previamente
  // =====================================================
  test("HU17_E02 – No se puede guardar una ruta si no se ha calculado previamente", async () => {
    await expect(
      routeService.saveRoute(
        TEST_EMAIL,
        "Ruta inexistente HU17"
      )
    ).rejects.toThrow("RouteNotCalculatedError");
  });
});

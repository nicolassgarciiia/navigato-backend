import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU16 – Calcular ruta según criterio (ATDD)", () => {
  let routeService: RouteService;
  let userService: UserService;

  const ORIGEN = { lat: 39.9869, lng: -0.0513 };
  const DESTINO = { lat: 40.4168, lng: -3.7038 };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, RouteModule],
    }).compile();

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
  // HU16_E01 – Ruta más rápida
  // ======================================
  test("HU16_E01 – Calcula la ruta más rápida", async () => {
    const route = await routeService.calculateRouteByType(
      TEST_EMAIL,
      ORIGEN,
      DESTINO,
      "vehiculo",
      "rapida"
    );

    expect(route).toBeDefined();
    expect(route.tipo).toBe("rapida");
    expect(route.distancia).toBeGreaterThan(0);
    expect(route.duracion).toBeGreaterThan(0);
  });

  // ======================================
  // HU16_E02 – Ruta más corta
  // ======================================
  test("HU16_E02 – Calcula la ruta más corta", async () => {
    const route = await routeService.calculateRouteByType(
      TEST_EMAIL,
      ORIGEN,
      DESTINO,
      "vehiculo",
      "corta"
    );

    expect(route).toBeDefined();
    expect(route.tipo).toBe("corta");
    expect(route.distancia).toBeGreaterThan(0);
    expect(route.duracion).toBeGreaterThan(0);
  });

  // ======================================
  // HU16_E03 – Ruta más económica
  // ======================================
  test("HU16_E03 – Calcula la ruta más económica", async () => {
    const route = await routeService.calculateRouteByType(
      TEST_EMAIL,
      ORIGEN,
      DESTINO,
      "vehiculo",
      "economica"
    );

    expect(route).toBeDefined();
    expect(route.tipo).toBe("economica");
    expect(route.distancia).toBeGreaterThan(0);
    expect(route.duracion).toBeGreaterThan(0);
  });
});

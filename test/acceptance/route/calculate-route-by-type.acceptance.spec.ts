import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { RouteService } from "../../../src/modules/route/application/route.service";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU16 – Calcular ruta según criterio (ATDD)", () => {
  let userService: UserService;
  let poiService: POIService;
  let routeService: RouteService;

  const email = `hu16_${crypto.randomUUID()}@test.com`;
  const password = "ValidPass1!";

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule, RouteModule],
    }).compile();

    userService = moduleRef.get(UserService);
    poiService = moduleRef.get(POIService);
    routeService = moduleRef.get(RouteService);

    await userService.register({
      nombre: "Usuario",
      apellidos: "HU16",
      correo: email,
      contraseña: password,
      repetirContraseña: password,
      aceptaPoliticaPrivacidad: true,
    });

    await poiService.createPOI(email, "Casa", 39.9869, -0.0513);
    await poiService.createPOI(email, "Trabajo", 40.4168, -3.7038);
  });

  afterAll(async () => {
    await userService.deleteByEmail(email);
  });

  // ======================================
  // HU16_E01 – Ruta más rápida
  // ======================================
  test("HU16_E01 – Calcula la ruta más rápida", async () => {
    const route = await routeService.calculateRouteByType(
      email,
      "Casa",
      "Trabajo",
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
    const route = await routeService.calculateRouteByType(
      email,
      "Casa",
      "Trabajo",
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
    const route = await routeService.calculateRouteByType(
      email,
      "Casa",
      "Trabajo",
      "vehiculo",
      "economica"
    );

    expect(route).toBeDefined();
    expect(route.tipo).toBe("economica");
  });
});

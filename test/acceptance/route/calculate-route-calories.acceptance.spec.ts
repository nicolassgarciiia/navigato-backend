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

describe("HU15 – Calcular coste calórico de una ruta (ATDD)", () => {
  let userService: UserService;
  let poiService: POIService;
  let routeService: RouteService;

  const email = `hu15_${crypto.randomUUID()}@test.com`;
  const password = "ValidPass1!";

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule, RouteModule],
    }).compile();

    userService = moduleRef.get(UserService);
    poiService = moduleRef.get(POIService);
    routeService = moduleRef.get(RouteService);

    // Usuario
    await userService.register({
      nombre: "Usuario",
      apellidos: "HU15",
      correo: email,
      contraseña: password,
      repetirContraseña: password,
      aceptaPoliticaPrivacidad: true,
    });

    // POIs
    await poiService.createPOI(email, "Casa", 39.9869, -0.0513);
    await poiService.createPOI(email, "Parque", 39.9875, -0.0521);

    // Ruta
    await routeService.calculateRoute(
      email,
      "Casa",
      "Parque",
      "pie"
    );
  });

  afterAll(async () => {
    await userService.deleteByEmail(email);
  });

  // ======================================
  // HU15_E01 – Escenario válido
  // ======================================
  test("HU15_E01 – Calcula el coste calórico de una ruta", async () => {
    const cost = await routeService.calculateRouteCalories(email);

    expect(cost).toBeDefined();
    expect(cost.tipo).toBe("calorias");
    expect(cost.costeEnergetico.valor).toBeGreaterThan(0);
    expect(cost.costeEnergetico.unidad).toBe("kcal");
    expect(cost.costeEconomico).toBeNull();
  });
});

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

describe("HU18 – Lista rutas guardadas (ATDD)", () => {
  let userService: UserService;
  let poiService: POIService;
  let routeService: RouteService;

  const email = `hu18_${crypto.randomUUID()}@test.com`;
  const password = "ValidPass1!";

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

    // Usuario
    await userService.register({
      nombre: "Usuario",
      apellidos: "HU18",
      correo: email,
      contraseña: password,
      repetirContraseña: password,
      aceptaPoliticaPrivacidad: true,
    });

    // POIs
    const origen = await poiService.createPOI(
      email,
      "Casa HU18",
      39.9869,
      -0.0513
    );

    const destino = await poiService.createPOI(
      email,
      "Trabajo HU18",
      40.4168,
      -3.7038
    );

    // 🔑 CAMBIO IMPORTANTE: coordenadas
    await routeService.calculateRoute(
      email,
      { lat: origen.latitud, lng: origen.longitud },
      { lat: destino.latitud, lng: destino.longitud },
      "vehiculo"
    );

    await routeService.saveRoute(email, "Ruta HU18");
  });

  afterAll(async () => {
    await userService.deleteByEmail(email);
  });

  // ======================================
  // HU18_E01 – Escenario válido
  // ======================================
  test("HU18_E01 – Lista las rutas guardadas del usuario", async () => {
    const routes = await routeService.listSavedRoutes(email);

    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);

    const route = routes.find(r => r.nombre === "Ruta HU18");
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

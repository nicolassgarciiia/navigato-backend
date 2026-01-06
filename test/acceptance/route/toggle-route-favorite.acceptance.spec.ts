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

describe("HU20 – Marcar ruta como favorita (ATDD)", () => {
  let userService: UserService;
  let poiService: POIService;
  let routeService: RouteService;

  const email = `hu20_${crypto.randomUUID()}@test.com`;
  const password = "ValidPass1!";

  // ======================================
  // SETUP ÚNICO DEL HU
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
      apellidos: "HU20",
      correo: email,
      contraseña: password,
      repetirContraseña: password,
      aceptaPoliticaPrivacidad: true,
    });

    // POIs
    const origen = await poiService.createPOI(
      email,
      "Casa HU20",
      39.9869,
      -0.0513
    );

    const destino = await poiService.createPOI(
      email,
      "Trabajo HU20",
      40.4168,
      -3.7038
    );

    // Ruta calculada (setup)
    await routeService.calculateRoute(
      email,
      { lat: origen.latitud, lng: origen.longitud },
      { lat: destino.latitud, lng: destino.longitud },
      "vehiculo"
    );

    // Ruta guardada (setup)
    await routeService.saveRoute(email, "Ruta HU20");
  });

  afterAll(async () => {
    await userService.deleteByEmail(email);
  });

  // ======================================================
  // HU20_E01 – Marca ruta como favorita
  // ======================================================
  test("HU20_E01 – Marca una ruta guardada como favorita", async () => {
    await routeService.toggleRouteFavorite(email, "Ruta HU20");

    const routes = await routeService.listSavedRoutes(email);
    const route = routes.find(r => r.nombre === "Ruta HU20");

    expect(route).toBeDefined();
    expect(route!.favorito).toBe(true);
  });

  // ======================================================
  // HU20_E02 – Ruta no existe
  // ======================================================
  test("HU20_E02 – Error si la ruta no existe", async () => {
    await expect(
      routeService.toggleRouteFavorite(email, "Ruta inexistente")
    ).rejects.toThrow("SavedRouteNotFoundError");
  });

  // ======================================================
  // HU20_E03 – Usuario no autenticado
  // ======================================================
  test("HU20_E03 – Error si el usuario no existe", async () => {
    await expect(
      routeService.toggleRouteFavorite(
        "no-existe@test.com",
        "Ruta HU20"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

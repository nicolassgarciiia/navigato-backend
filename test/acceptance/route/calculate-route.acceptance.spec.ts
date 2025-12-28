import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { POIModule } from "../../../src/modules/poi/poi.module";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU13 – Calcular ruta entre dos lugares (ATDD)", () => {
  let routeService: RouteService;
  let userService: UserService;
  let poiService: POIService;

  const email = `hu13_${crypto.randomUUID()}@test.com`;
  const password = "ValidPass1!";

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule, RouteModule],
    }).compile();

    routeService = moduleRef.get(RouteService);
    userService = moduleRef.get(UserService);
    poiService = moduleRef.get(POIService);

    await userService.register({
      nombre: "Usuario",
      apellidos: "HU13",
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
  // HU13_E01 – Escenario válido
  // ======================================
  test("HU13_E01 – Calcula una ruta válida entre dos lugares", async () => {
    const route = await routeService.calculateRoute(
      email,
      "Casa",
      "Trabajo",
      "vehiculo"
    );

    expect(route).toBeDefined();
    expect(route.origen.nombre).toBe("Casa");
    expect(route.destino.nombre).toBe("Trabajo");
    expect(route.distancia).toBeGreaterThan(0);
    expect(route.duracion).toBeGreaterThan(0);
  });

  // ======================================
  // HU13_E02 – Lugar inválido
  // ======================================
  test("HU13_E02 – Lugar inexistente", async () => {
    await expect(
      routeService.calculateRoute(email, "Casa", "Playa", "vehiculo")
    ).rejects.toThrow("InvalidPlaceOfInterestError");
  });

  // ======================================
  // HU13_E03 – Usuario no autenticado
  // ======================================
  test("HU13_E03 – Usuario no autenticado", async () => {
    await expect(
      routeService.calculateRoute(
        "no-existe@test.com",
        "Casa",
        "Trabajo",
        "vehiculo"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

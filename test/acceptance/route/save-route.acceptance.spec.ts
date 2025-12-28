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

describe("HU17 – Guardar ruta (ATDD)", () => {
  let userService: UserService;
  let poiService: POIService;
  let routeService: RouteService;

  const email = `hu17_${crypto.randomUUID()}@test.com`;
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
      apellidos: "HU17",
      correo: email,
      contraseña: password,
      repetirContraseña: password,
      aceptaPoliticaPrivacidad: true,
    });

    // POIs
    await poiService.createPOI(email, "Casa", 39.9869, -0.0513);
    await poiService.createPOI(email, "Trabajo", 40.4168, -3.7038);

    // Ruta calculada (requisito de HU17)
    await routeService.calculateRoute(
      email,
      "Casa",
      "Trabajo",
      "vehiculo"
    );
  });

  afterAll(async () => {
    await userService.deleteByEmail(email);
  });

  // ======================================
  // HU17_E01 – Escenario válido
  // ======================================
  test("HU17_E01 – Guarda una ruta correctamente", async () => {
    const saved = await routeService.saveRoute(
      email,
      "Ruta al trabajo"
    );

    expect(saved).toBeDefined();
    expect(saved.nombre).toBe("Ruta al trabajo");
    expect(saved.favorito).toBe(false);
    expect(saved.fechaGuardado).toBeDefined();
  });
});

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

describe("HU19 – Elimina ruta guardada (ATDD)", () => {
  let userService: UserService;
  let poiService: POIService;
  let routeService: RouteService;

  const email = `hu19_${crypto.randomUUID()}@test.com`;
  const password = "ValidPass1!";

  let origen: any;
  let destino: any;

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

    await userService.register({
      nombre: "Usuario",
      apellidos: "HU19",
      correo: email,
      contraseña: password,
      repetirContraseña: password,
      aceptaPoliticaPrivacidad: true,
    });

    origen = await poiService.createPOI(
      email,
      "Casa HU19",
      39.9869,
      -0.0513
    );

    destino = await poiService.createPOI(
      email,
      "Trabajo HU19",
      40.4168,
      -3.7038
    );

    await routeService.calculateRoute(
      email,
      { lat: origen.latitud, lng: origen.longitud },
      { lat: destino.latitud, lng: destino.longitud },
      "vehiculo"
    );

    await routeService.saveRoute(email, "Ruta HU19");
  });

  afterAll(async () => {
    await userService.deleteByEmail(email);
  });

  // ======================================
  // HU19_E01 – Escenario válido
  // ======================================
  test("HU19_E01 – Elimina una ruta guardada existente", async () => {
    await expect(
      routeService.delete(email, "Ruta HU19")
    ).resolves.toBeUndefined();

    const routes = await routeService.listSavedRoutes(email);
    const deleted = routes.find(r => r.nombre === "Ruta HU19");
    expect(deleted).toBeUndefined();
  });

  // ======================================
  // HU19_E02 – Escenario inválido
  // ======================================
  test("HU19_E02 – No se puede eliminar una ruta que no existe", async () => {
    await expect(
      routeService.delete(email, "Ruta inexistente")
    ).rejects.toThrow("SavedRouteNotFoundError");
  });
});

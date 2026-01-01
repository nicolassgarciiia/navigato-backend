import { Test } from "@nestjs/testing";
import { RouteModule } from "../../../src/modules/route/route.module";
import { UserModule } from "../../../src/modules/user/user.module";
import { RouteService } from "../../../src/modules/route/application/route.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL } from "../../helpers/test-constants";

dotenv.config();

describe("HU20 – Marcar ruta como favorita (ATDD)", () => {
  let routeService: RouteService;

  // 🧹 Nombres de rutas para limpiar después de cada test
  let routeNamesToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, RouteModule],
    }).compile();

    routeService = moduleRef.get(RouteService);
  });

  afterEach(async () => {
    for (const name of routeNamesToDelete) {
      try {
        await routeService.deleteSavedRoute(TEST_EMAIL, name);
      } catch {}
    }
    routeNamesToDelete = [];
  });

  // ==================================================
  // HU20_E01 – Marcar ruta como favorita con éxito
  // ==================================================
  test("HU20_E01 – Debe marcar una ruta guardada como favorita", async () => {
    const nombreRuta = "Ruta al trabajo";

    // GIVEN: El usuario tiene una ruta calculada y guardada
    await routeService.calculateRoute(TEST_EMAIL, "Casa", "Trabajo", "CAR");
    await routeService.saveRoute(TEST_EMAIL, nombreRuta);
    routeNamesToDelete.push(nombreRuta);

    // WHEN: El usuario marca la ruta como favorita
    await routeService.toggleRouteFavorite(TEST_EMAIL, nombreRuta);

    // THEN: El atributo favorito debe ser true
    const savedRoutes = await routeService.listSavedRoutes(TEST_EMAIL);
    const route = savedRoutes.find((r) => r.nombre === nombreRuta);

    expect(route).toBeDefined();
    expect(route!.favorito).toBe(true);
  });

  // ==================================================
  // HU20_E02 – Ruta no existe
  // ==================================================
  test("HU20_E02 – Debe lanzar error si la ruta no existe", async () => {
    // Intentamos marcar una ruta que nunca se guardó
    await expect(
      routeService.toggleRouteFavorite(TEST_EMAIL, "Ruta Fantasma")
    ).rejects.toThrow("SavedRouteNotFoundError"); 
    // Nota: Si en tu Gherkin pusiste NameWithoutRouteError, cámbialo aquí para que coincida
  });

  // ==================================================
  // HU20_E04 – Usuario no autenticado
  // ==================================================
  test("HU20_E04 – Debe lanzar error si el usuario no tiene sesión", async () => {
    await expect(
      routeService.toggleRouteFavorite("noexiste@test.com", "Cualquier Ruta")
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // ==================================================
  // HU20_E05 – Desmarcar ruta como favorita
  // ==================================================
  test("HU20_E05 – Debe desmarcar una ruta que ya era favorita", async () => {
    const nombreRuta = "Ruta al Gimnasio";

    // GIVEN: Una ruta guardada y marcada como favorita
    await routeService.calculateRoute(TEST_EMAIL, "Casa", "Gimnasio", "CAR");
    await routeService.saveRoute(TEST_EMAIL, nombreRuta);
    routeNamesToDelete.push(nombreRuta);
    
    // La marcamos primero
    await routeService.toggleRouteFavorite(TEST_EMAIL, nombreRuta);

    // WHEN: El usuario vuelve a hacer toggle (desmarcar)
    await routeService.toggleRouteFavorite(TEST_EMAIL, nombreRuta);

    // THEN: El atributo favorito debe volver a false
    const savedRoutes = await routeService.listSavedRoutes(TEST_EMAIL);
    const route = savedRoutes.find((r) => r.nombre === nombreRuta);

    expect(route!.favorito).toBe(false);
  });
});
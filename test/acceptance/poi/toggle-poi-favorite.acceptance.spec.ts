import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL } from "../../helpers/test-constants";

dotenv.config();

describe("HU20 – Marcar POI como favorito (ATDD)", () => {
  let poiService: POIService;
  let userService: UserService;

  let poiIdsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule],
    }).compile();

    poiService = moduleRef.get(POIService);
    userService = moduleRef.get(UserService);
  });

  // Limpieza de datos después de cada test
  afterEach(async () => {
    for (const poiId of poiIdsToDelete) {
      try {
        await poiService.deletePOI(TEST_EMAIL, poiId);
      } catch {}
    }
    poiIdsToDelete = [];
  });

  // ==================================================
  // HU20_E01 – Marcar POI como favorito
  // ==================================================
  test("HU20_E01 – Marca POI como favorito con éxito", async () => {
    // 1. GIVEN: Creamos un POI (por defecto favorito suele ser false)
    const poi = await poiService.createPOI(TEST_EMAIL, "Casa", 41.38, 2.17);
    poiIdsToDelete.push(poi.id);

    // 2. WHEN: Llamamos al método con el ID del POI
    await poiService.togglePoiFavorite(TEST_EMAIL, poi.id);

    // 3. THEN: Verificamos que el estado ha cambiado
    const pois = await poiService.listByUser(TEST_EMAIL);
    const updated = pois.find((p) => p.id === poi.id);

    expect(updated).toBeDefined();
    expect(updated!.favorito).toBe(true);
  });

  // ==================================================
  // HU20_E02 – POI no existe
  // ==================================================
  test("HU20_E02 – Error si el POI no existe", async () => {
    const idInexistente = "00000000-0000-0000-0000-000000000000";
    
    await expect(
      poiService.togglePoiFavorite(TEST_EMAIL, idInexistente)
    ).rejects.toThrow("PlaceOfInterestNotFoundError");
  });

  // ==================================================
  // HU20_E03 – Usuario no autenticado (Email no válido)
  // ==================================================
  test("HU20_E03 – Error si el usuario no está autenticado", async () => {
    await expect(
      poiService.togglePoiFavorite("no-existe@test.com", "any-id")
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // ==================================================
  // HU20_E05 – Desmarcar POI como favorito
  // ==================================================
  test("HU20_E05 – Desmarca un POI que ya era favorito", async () => {
    // 1. GIVEN: Creamos y marcamos como favorito
    const poi = await poiService.createPOI(TEST_EMAIL, "Trabajo", 41.39, 2.18);
    poiIdsToDelete.push(poi.id);
    
    await poiService.togglePoiFavorite(TEST_EMAIL, poi.id); // Primera vez -> true

    // 2. WHEN: Volvemos a llamar al toggle
    await poiService.togglePoiFavorite(TEST_EMAIL, poi.id); // Segunda vez -> false

    // 3. THEN: Verificamos que ahora es false
    const pois = await poiService.listByUser(TEST_EMAIL);
    const updated = pois.find((p) => p.id === poi.id);

    expect(updated!.favorito).toBe(false);
  });
});
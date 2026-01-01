import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";

dotenv.config();

describe("POI – ATDD / Integration", () => {
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

  afterEach(async () => {
    for (const poiId of poiIdsToDelete) {
      try {
        await poiService.deletePOI(TEST_EMAIL, poiId);
      } catch {}
    }
    poiIdsToDelete = [];
  });

  // ======================================================
  // HU05 – Alta de POI por coordenadas
  // ======================================================
  test("HU05_E01 – Crea POI con coordenadas válidas", async () => {
    const poi = await poiService.createPOI(
      TEST_EMAIL,
      "HU05_Casa",
      41.38,
      2.17
    );

    poiIdsToDelete.push(poi.id);

    expect(poi).toBeDefined();
    expect(poi.nombre).toBe("HU05_Casa");
    expect(poi.favorito).toBe(false);
  });

  test("HU05_E02 – Error si coordenadas inválidas", async () => {
    await expect(
      poiService.createPOI(TEST_EMAIL, "HU05_Bad", 200, 300)
    ).rejects.toThrow("InvalidCoordinatesFormatError");
  });

  // ======================================================
  // HU07 – Listado de POIs
  // ======================================================
  test("HU07_E01 – Lista POIs del usuario", async () => {
    const poi = await poiService.createPOI(
      TEST_EMAIL,
      "HU07_Parque",
      41.39,
      2.18
    );

    poiIdsToDelete.push(poi.id);

    const pois = await poiService.listByUser(TEST_EMAIL);

    expect(pois.length).toBeGreaterThan(0);
    expect(pois.some(p => p.id === poi.id)).toBe(true);
  });

  // ======================================================
  // HU08 – Borrado de POI
  // ======================================================
  test("HU08_E01 – Borra POI existente", async () => {
    const poi = await poiService.createPOI(
      TEST_EMAIL,
      "HU08_Delete",
      41.40,
      2.19
    );

    await poiService.deletePOI(TEST_EMAIL, poi.id);

    const pois = await poiService.listByUser(TEST_EMAIL);
    expect(pois.find(p => p.id === poi.id)).toBeUndefined();
  });

  test("HU08_E02 – Error si POI no existe", async () => {
    await expect(
      poiService.deletePOI(
        TEST_EMAIL,
        "00000000-0000-0000-0000-000000000000"
      )
    ).rejects.toThrow("PlaceOfInterestNotFoundError");
  });

  // ======================================================
  // HU20 – Marcar POI como favorito
  // ======================================================
  test("HU20_E01 – Marca POI como favorito", async () => {
    const poi = await poiService.createPOI(
      TEST_EMAIL,
      "HU20_Fav",
      41.41,
      2.20
    );
    poiIdsToDelete.push(poi.id);

    await poiService.togglePoiFavorite(TEST_EMAIL, poi.id);

    const pois = await poiService.listByUser(TEST_EMAIL);
    const updated = pois.find(p => p.id === poi.id);

    expect(updated!.favorito).toBe(true);
  });

  test("HU20_E05 – Desmarca POI favorito", async () => {
    const poi = await poiService.createPOI(
      TEST_EMAIL,
      "HU20_Unfav",
      41.42,
      2.21
    );
    poiIdsToDelete.push(poi.id);

    await poiService.togglePoiFavorite(TEST_EMAIL, poi.id);
    await poiService.togglePoiFavorite(TEST_EMAIL, poi.id);

    const pois = await poiService.listByUser(TEST_EMAIL);
    const updated = pois.find(p => p.id === poi.id);

    expect(updated!.favorito).toBe(false);
  });
});

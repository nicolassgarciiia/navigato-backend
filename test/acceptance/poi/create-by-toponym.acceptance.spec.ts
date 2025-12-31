import { Test } from "@nestjs/testing";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL} from "../../helpers/test-constants";

dotenv.config();

describe("HU06 – Alta de POI por topónimo (ATDD)", () => {
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

  // ==================================================
  // Limpieza: SOLO los POIs creados en el test
  // ==================================================
  afterEach(async () => {
    for (const poiId of poiIdsToDelete) {
      try {
        await poiService.delete(poiId);
      } catch {
      }
    }
    poiIdsToDelete = [];
  });

  // =====================================================
  // HU06_E01 – Alta por topónimo exitosa
  // =====================================================
  test("HU06_E01 – Alta por topónimo exitosa", async () => {
    const poi = await poiService.createByToponym(
      TEST_EMAIL,
      "Recuerdo de París",
      "Torre Eiffel, París, Francia"
    );

    poiIdsToDelete.push(poi.id);

    expect(poi).toBeDefined();
    expect(poi.nombre).toBe("Recuerdo de París");
    expect(poi.toponimo).toContain("Eiffel");
    expect(poi.latitud).toBeCloseTo(48.8584, 1);
    expect(poi.longitud).toBeCloseTo(2.2945, 1);
    expect(poi.favorito).toBe(false);
  });

  // =====================================================
  // HU06_E04 – Sesión no iniciada
  // =====================================================
  test("HU06_E04 – Usuario no autenticado", async () => {
    await expect(
      poiService.createByToponym(
        "no-existe@test.com",
        "Lugar",
        "Madrid"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // =====================================================
  // HU06_E06 – Nombre de POI repetido
  // =====================================================
  test("HU06_E06 – Nombre de POI repetido para el mismo usuario", async () => {
    const poi = await poiService.createByToponym(
      TEST_EMAIL,
      "Mi Lugar Favorito",
      "Madrid"
    );

    poiIdsToDelete.push(poi.id);

    await expect(
      poiService.createByToponym(
        TEST_EMAIL,
        "Mi Lugar Favorito",
        "Barcelona"
      )
    ).rejects.toThrow("DuplicatePOINameError");
  });
});

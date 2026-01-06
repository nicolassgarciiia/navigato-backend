import { Test } from "@nestjs/testing";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";
import { randomUUID } from "crypto";

dotenv.config();

describe("HU05 – Alta de POI con coordenadas (ATDD)", () => {
  let poiService: POIService;
  let userService: UserService;

  let poiIdsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule],
    }).compile();

    poiService = moduleRef.get(POIService);
    userService = moduleRef.get(UserService);

    // 🔐 Asegurar usuario de test (UNA SOLA VEZ)
    const user = await userService.findByEmail(TEST_EMAIL);

    if (!user) {
      await userService.register({
        nombre: "Usuario",
        apellidos: "Test ATDD",
        correo: TEST_EMAIL,
        contraseña: TEST_PASSWORD,
        repetirContraseña: TEST_PASSWORD,
        aceptaPoliticaPrivacidad: true,
      });
    }
  });

  // ==================================================
  // Limpieza SOLO de los POI creados en el test
  // ==================================================
  afterEach(async () => {
    for (const poiId of poiIdsToDelete) {
      try {
        await poiService.delete(poiId);
      } catch {
        // limpieza best-effort
      }
    }
    poiIdsToDelete = [];
  });

  // ======================================
  // HU05_E01 – Escenario válido
  // ======================================
  test("HU05_E01 – Alta de POI con coordenadas válidas", async () => {
    const poiName = `Casa-${randomUUID()}`;

    const poi = await poiService.createPOI(
      TEST_EMAIL,
      poiName,
      39.9869,
      -0.0513
    );

    poiIdsToDelete.push(poi.id);

    expect(poi).toBeDefined();
    expect(poi.nombre).toBe(poiName);
    expect(poi.latitud).toBe(39.9869);
    expect(poi.longitud).toBe(-0.0513);
    expect(poi.toponimo).toBeDefined();
    expect(poi.favorito).toBe(false);
  });

  // ======================================
  // HU05_E02 – Coordenadas inválidas
  // ======================================
  test("HU05_E02 – Coordenadas fuera de rango", async () => {
    const poiName = `Trabajo-${randomUUID()}`;

    await expect(
      poiService.createPOI(
        TEST_EMAIL,
        poiName,
        120.5432,
        -250.0021
      )
    ).rejects.toThrow("InvalidCoordinatesFormatError");
  });

  // ======================================
  // HU05_E04 – Nombre inválido
  // ======================================
  test("HU05_E04 – Nombre inválido", async () => {
    await expect(
      poiService.createPOI(
        TEST_EMAIL,
        "Ca",
        39.9,
        -0.05
      )
    ).rejects.toThrow("InvalidPOINameError");
  });

  // ======================================
  // HU05_E05 – Usuario no autenticado
  // ======================================
  test("HU05_E05 – Usuario no autenticado", async () => {
    await expect(
      poiService.createPOI(
        "no-existe@test.com",
        "Casa",
        39.9,
        -0.05
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

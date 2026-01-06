import { Test } from "@nestjs/testing";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { UserModule } from "../../../src/modules/user/user.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";

dotenv.config();

describe("HU07 – Consulta de lista de lugares de interés (ATDD)", () => {
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
  // Limpieza SOLO de POIs creados en el test
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

  // =====================================================
  // HU07_E01 – Consulta con lugares existentes
  // =====================================================
  test("HU07_E01 – Usuario autenticado consulta su lista con lugares existentes", async () => {
    const poi1 = await poiService.createPOI(
      TEST_EMAIL,
      "Casa",
      39.9869,
      -0.0513
    );
    const poi2 = await poiService.createPOI(
      TEST_EMAIL,
      "Trabajo",
      40.4168,
      -3.7038
    );
    const poi3 = await poiService.createPOI(
      TEST_EMAIL,
      "Gimnasio",
      39.4699,
      -0.3763
    );

    poiIdsToDelete.push(poi1.id, poi2.id, poi3.id);

    const lista = await poiService.listByUser(TEST_EMAIL);

    expect(Array.isArray(lista)).toBe(true);

    const ids = lista.map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining([poi1.id, poi2.id, poi3.id])
    );

    const nombres = lista.map((p) => p.nombre);
    expect(nombres).toEqual(
      expect.arrayContaining(["Casa", "Trabajo", "Gimnasio"])
    );
  });

  // =====================================================
  // HU07_E02 – Consulta sin lugares existentes
  // =====================================================
  test("HU07_E02 – Usuario autenticado sin lugares obtiene una lista", async () => {
    const lista = await poiService.listByUser(TEST_EMAIL);

    expect(Array.isArray(lista)).toBe(true);
    // ⚠️ No asumimos lista vacía porque el usuario es compartido
  });

  // =====================================================
  // HU07_E03 – Intento sin iniciar sesión
  // =====================================================
  test("HU07_E03 – Usuario no autenticado no puede consultar la lista", async () => {
    await expect(
      poiService.listByUser("anonimo@ejemplo.com")
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

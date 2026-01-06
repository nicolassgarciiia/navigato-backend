import { Test } from "@nestjs/testing";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import { PlaceOfInterestNotFoundError } from "../../../src/modules/poi/domain/errors";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";

dotenv.config();

describe("HU08 – Eliminar Lugar de Interés (ATDD)", () => {
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

  // ======================================================
  // HU08_E01 – Eliminación exitosa
  // ======================================================
  test("HU08_E01 – Eliminación exitosa del lugar", async () => {
    const poiToDelete = await poiService.createPOI(
      TEST_EMAIL,
      "Lugar para Borrar",
      40.4167,
      -3.7038
    );
    poiIdsToDelete.push(poiToDelete.id);

    const backupPoi = await poiService.createPOI(
      TEST_EMAIL,
      "Lugar de Respaldo",
      39.4699,
      -0.3763
    );
    poiIdsToDelete.push(backupPoi.id);

    // ACT
    await poiService.deletePOI(TEST_EMAIL, poiToDelete.id);

    // evitar doble borrado en afterEach
    poiIdsToDelete = poiIdsToDelete.filter(
      id => id !== poiToDelete.id
    );

    // ASSERT
    const poisAfterDeletion = await poiService.listByUser(TEST_EMAIL);

    expect(
      poisAfterDeletion.find(p => p.id === poiToDelete.id)
    ).toBeUndefined();

    expect(
      poisAfterDeletion.find(p => p.id === backupPoi.id)
    ).toBeDefined();
  });

  // ======================================================
  // HU08_E02 – Lugar no existe
  // ======================================================
  test("HU08_E02 – Lugar no existe o ya fue eliminado", async () => {
    await expect(
      poiService.deletePOI(
        TEST_EMAIL,
        "b8c0d1e2-3f4a-5b6c-7d8e-9f0a1b2c3d4e"
      )
    ).rejects.toThrow(PlaceOfInterestNotFoundError);
  });

  // ======================================================
  // HU08_E04 – Usuario no autenticado
  // ======================================================
  test("HU08_E04 – Intento de borrado con usuario no registrado", async () => {
    await expect(
      poiService.deletePOI(
        "no_registrado@test.com",
        "algun-id-valido"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

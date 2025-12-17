import { Test } from "@nestjs/testing";
import { AppModule } from "../../../src/app.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import { POI } from "../../../src/modules/poi/domain/poi.entity";
import * as dotenv from "dotenv";
import { PlaceOfInterestNotFoundError } from "../../../src/modules/poi/domain/errors";

dotenv.config();

const TEST_USER_EMAIL = `hu08_user_${Date.now()}@test.com`;
const TEST_POI_NAME_1 = `Lugar para Borrar ${Date.now()}`;
const TEST_POI_NAME_2 = `Lugar de Respaldo ${Date.now()}`;

describe("HU08 – Eliminar Lugar de Interés (ATDD)", () => {
  let poiService: POIService;
  let userService: UserService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    poiService = moduleRef.get(POIService);
    userService = moduleRef.get(UserService);

    await userService.register({
      nombre: "Test",
      apellidos: "POI",
      correo: TEST_USER_EMAIL,
      contraseña: "ValidPass1!",
      repetirContraseña: "ValidPass1!",
      aceptaPoliticaPrivacidad: true,
    });
  });

  afterAll(async () => {
    try {
      await userService.deleteAccount(TEST_USER_EMAIL);
    } catch {
      // ignore
    }
  });

  // ======================================================
  // HU08_E01 – Eliminación exitosa
  // ======================================================
  test("HU08_E01 – Eliminación exitosa del lugar", async () => {
    const poiToDelete: POI = await poiService.createPOI(
      TEST_USER_EMAIL,
      TEST_POI_NAME_1,
      40.4167,
      -3.7038
    );

    const backupPoi: POI = await poiService.createPOI(
      TEST_USER_EMAIL,
      TEST_POI_NAME_2,
      39.4699,
      -0.3763
    );

    await poiService.deletePOI(TEST_USER_EMAIL, poiToDelete.id);

    const poisAfterDeletion = await poiService.listByUser(TEST_USER_EMAIL);

    expect(poisAfterDeletion.find((p) => p.id === poiToDelete.id)).toBeUndefined();
    expect(poisAfterDeletion.find((p) => p.id === backupPoi.id)).toBeDefined();

    // cleanup del backup
    await poiService.deletePOI(TEST_USER_EMAIL, backupPoi.id);
  });

  // ======================================================
  // HU08_E02 – Lugar no existe
  // ======================================================
  test("HU08_E02 – Lugar no existe o ya fue eliminado", async () => {
    await expect(
      poiService.deletePOI(
        TEST_USER_EMAIL,
        "b8c0d1e2-3f4a-5b6c-7d8e-9f0a1b2c3d4e"
      )
    ).rejects.toThrow(PlaceOfInterestNotFoundError);
  });

  // ======================================================
  // HU08_E04 – Intento sin iniciar sesión (usuario no existe)
  // ======================================================
  test("HU08_E04 – Intento de borrado con usuario no registrado", async () => {
    const email = `no_registrado_${Date.now()}@test.com`;

    await expect(
      poiService.deletePOI(email, "algun-id-valido")
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

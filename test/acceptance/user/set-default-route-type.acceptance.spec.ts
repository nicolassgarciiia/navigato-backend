import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserPreferencesModule } from "../../../src/modules/user-preferences/user-preferences.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import { UserPreferencesService } from "../../../src/modules/user-preferences/application/user-preferences.service";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU22 – Establecer tipo de ruta por defecto (ACCEPTANCE)", () => {
  let userService: UserService;
  let preferencesService: UserPreferencesService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, UserPreferencesModule],
    }).compile();

    userService = moduleRef.get(UserService);
    preferencesService = moduleRef.get(UserPreferencesService);

  });

  // ==================================================
  // HU22_E01 – Caso válido
  // ==================================================
  test("HU22_E01 – Establece el tipo de ruta por defecto correctamente", async () => {
    await preferencesService.setDefaultRouteType(
      TEST_EMAIL,
      "rapida"
    );

    const preferences =
      await preferencesService.getByUser(TEST_EMAIL);

    expect(preferences.defaultRouteType).toBe("rapida");
  });

  // ==================================================
  // HU22_E02 – Tipo de ruta inválido
  // ==================================================
  test("HU22_E02 – Error si el tipo de ruta no existe", async () => {
    await expect(
      preferencesService.setDefaultRouteType(
        TEST_EMAIL,
        "voladora"
      )
    ).rejects.toThrow("InvalidRouteTypeError");
  });

  // ==================================================
  // HU22_E03 – Usuario no autenticado
  // ==================================================
  test("HU22_E03 – Error si el usuario no existe", async () => {
    await expect(
      preferencesService.setDefaultRouteType(
        "no-existe@test.com",
        "economica"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

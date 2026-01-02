import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { UserPreferencesModule } from "../../../src/modules/user-preferences/user-preferences.module";
import { AppStateService } from "../../../src/modules/app-state/application/app-state.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU23 – Restaurar estado de la aplicación (ACCEPTANCE)", () => {
  let appStateService: AppStateService;
  let userService: UserService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        UserModule,
        VehicleModule,
        POIModule,
        RouteModule,
        UserPreferencesModule,
      ],
      providers: [AppStateService],
    }).compile();

    appStateService = moduleRef.get(AppStateService);
    userService = moduleRef.get(UserService);

  });

  // ==================================================
  // HU23_E01 – Escenario válido
  // ==================================================
  test("HU23_E01 – El usuario visualiza correctamente su última sesión", async () => {
    const state = await appStateService.restoreApplicationState(
      TEST_EMAIL
    );

    expect(state.user.email).toBe(TEST_EMAIL);
    expect(Array.isArray(state.places)).toBe(true);
    expect(Array.isArray(state.vehicles)).toBe(true);
    expect(Array.isArray(state.savedRoutes)).toBe(true);
    expect(state.preferences).toBeDefined();
  });

  // ==================================================
  // HU23_E02 – Fallo de persistencia
  // ==================================================
  test("HU23_E02 – Error si no hay conexión con persistencia", async () => {
    await expect(
      appStateService.restoreApplicationState("no-existe@test.com")
    ).rejects.toThrow();
  });
});

import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { UserPreferencesModule } from "../../../src/modules/user-preferences/user-preferences.module";
import { UserPreferencesService } from "../../../src/modules/user-preferences/application/user-preferences.service";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import { TEST_EMAIL, TEST_PASSWORD } from "../../helpers/test-constants";

describe("HU21 – Establecer vehículo por defecto (ATDD)", () => {
  let preferencesService: UserPreferencesService;
  let vehicleService: VehicleService;
  let userService: UserService;

  let vehicleIdsToDelete: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        UserModule,
        VehicleModule,
        UserPreferencesModule,
      ],
    }).compile();

    preferencesService = moduleRef.get(UserPreferencesService);
    vehicleService = moduleRef.get(VehicleService);
    userService = moduleRef.get(UserService);

    // 🔐 Asegurar usuario de test (UNA SOLA VEZ)
    const existing = await userService.findByEmail(TEST_EMAIL);

    if (!existing) {
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
  // Limpieza correcta respetando FK
  // ==================================================
  afterEach(async () => {
  try {
    await preferencesService.clearDefaultVehicle(TEST_EMAIL);
  } catch {}

  for (const vehicleId of vehicleIdsToDelete) {
    try {
      await vehicleService.delete(vehicleId);
    } catch {}
  }

  vehicleIdsToDelete = [];
});


  // ==================================================
  // HU21_E01 – Escenario válido
  // ==================================================
  test("HU21_E01 – Se establece el vehículo por defecto correctamente", async () => {
    const vehicle = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Coche familiar",
      "7750LHF",
      "COMBUSTION",
      6.5
    );

    vehicleIdsToDelete.push(vehicle.id);

    await preferencesService.setDefaultVehicle(
      TEST_EMAIL,
      vehicle.id
    );

    const prefs = await preferencesService.getByUser(TEST_EMAIL);
    expect(prefs.defaultVehicleId).toBe(vehicle.id);
  });

  // ==================================================
  // HU21_E02 – Vehículo NO existe
  // ==================================================
  test("HU21_E02 – Error si el vehículo no existe", async () => {
    await expect(
      preferencesService.setDefaultVehicle(
        TEST_EMAIL,
        "vehiculo-inexistente"
      )
    ).rejects.toThrow("ElementNotFoundError");
  });

  // ==================================================
  // HU21_E04 – Usuario NO autenticado
  // ==================================================
  test("HU21_E04 – Error si el usuario no existe", async () => {
    await expect(
      preferencesService.setDefaultVehicle(
        "no-existe@test.com",
        "any-id"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { UserPreferencesModule } from "../../../src/modules/user-preferences/user-preferences.module";
import { UserPreferencesService } from "../../../src/modules/user-preferences/application/user-preferences.service";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { TEST_EMAIL } from "../../helpers/test-constants";

describe("HU21 – Establecer vehículo/modo de transporte por defecto (ATDD)", () => {
  let preferencesService: UserPreferencesService;
  let vehicleService: VehicleService;

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
  });

  // ==================================================
  // HU21_E01 – Escenario VÁLIDO
  // ==================================================
  test("HU21_E01 – Se establece el vehículo por defecto correctamente", async () => {
    const vehicle = await vehicleService.createVehicle(
      TEST_EMAIL,
      "Coche familiar",
      "7750LHF",
      "COMBUSTION",
      6.5
    );

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
  test("HU21_E04 – Error si el usuario no tiene sesión iniciada", async () => {
    await expect(
      preferencesService.setDefaultVehicle(
        "no-existe@test.com",
        "any-id"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

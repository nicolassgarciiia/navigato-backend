import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU20 – Marcar vehículo como favorito (ATDD)", () => {
  let vehicleService: VehicleService;
  let userService: UserService;

  const email = `hu20_${crypto.randomUUID()}@test.com`;
  const password = "ValidPass1!";
  const vehicleId = crypto.randomUUID();

  // ======================================
  // SETUP
  // ======================================
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, VehicleModule],
    }).compile();

    vehicleService = moduleRef.get(VehicleService);
    userService = moduleRef.get(UserService);

    // GIVEN: usuario registrado
    await userService.register({
      nombre: "Usuario",
      apellidos: "HU20",
      correo: email,
      contraseña: password,
      repetirContraseña: password,
      aceptaPoliticaPrivacidad: true,
    });
  });

  afterAll(async () => {
    await userService.deleteByEmail(email);
  });

  // ======================================
  // HU20_E01 – Escenario válido
  // ======================================
  test("HU20_E01 – Marcar vehículo como favorito", async () => {
    await expect(
      vehicleService.setVehicleFavorite(email, vehicleId, true)
    ).resolves.toBeUndefined();
  });

  // ======================================
  // HU20_E02 – Usuario no autenticado
  // ======================================
  test("HU20_E02 – Usuario no autenticado", async () => {
    await expect(
      vehicleService.setVehicleFavorite("no-existe@test.com", vehicleId, true)
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // ======================================
  // HU20_E03 – Vehículo no existe
  // ======================================
  test("HU20_E03 – Vehículo no existe", async () => {
    await expect(
      vehicleService.setVehicleFavorite(email, "vehiculo-inexistente", true)
    ).rejects.toThrow("VehicleNotFoundError");
  });
});

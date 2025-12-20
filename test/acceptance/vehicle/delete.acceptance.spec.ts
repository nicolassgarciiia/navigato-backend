import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU11 – Borrado de vehículo (ATDD)", () => {
  let vehicleService: VehicleService;
  let userService: UserService;

  const email = `hu11_${crypto.randomUUID()}@test.com`;
  const password = "ValidPass1!";
  const vehicleId = crypto.randomUUID();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, VehicleModule],
    }).compile();

    vehicleService = moduleRef.get(VehicleService);
    userService = moduleRef.get(UserService);

    // GIVEN: usuario registrado
    await userService.register({
      nombre: "Usuario",
      apellidos: "HU11",
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
  // HU11_E01 – Escenario válido
  // ======================================
  test("HU11_E01 – Borrar vehículo existente", async () => {
    await expect(
      vehicleService.deleteVehicle(email, vehicleId)
    ).resolves.toBeUndefined();
  });

  // ======================================
  // HU11_E02 – Usuario no autenticado
  // ======================================
  test("HU11_E02 – Usuario no autenticado", async () => {
    await expect(
      vehicleService.deleteVehicle("no-existe@test.com", vehicleId)
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // ======================================
  // HU11_E03 – Vehículo no existe
  // ======================================
  test("HU11_E03 – Vehículo no existe", async () => {
    await expect(
      vehicleService.deleteVehicle(email, "vehiculo-inexistente")
    ).rejects.toThrow("VehicleNotFoundError");
  });
});

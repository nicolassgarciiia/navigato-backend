import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU12 – Modificar vehículo (ATDD)", () => {
  let vehicleService: VehicleService;
  let userService: UserService;

  const email = `hu12_${crypto.randomUUID()}@test.com`;
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
      apellidos: "HU12",
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
  // HU12_E01 – Escenario válido
  // ======================================
  test("HU12_E01 – Modificar consumo de vehículo", async () => {
    await expect(
      vehicleService.updateVehicle(email, vehicleId, 5.4)
    ).resolves.toBeUndefined();
  });

  // ======================================
  // HU12_E02 – Consumo inválido
  // ======================================
  test("HU12_E02 – Consumo negativo → error", async () => {
    await expect(
      vehicleService.updateVehicle(email, vehicleId, -3)
    ).rejects.toThrow("InvalidVehicleConsumptionError");
  });

  // ======================================
  // HU12_E03 – Usuario no autenticado
  // ======================================
  test("HU12_E03 – Usuario no autenticado", async () => {
    await expect(
      vehicleService.updateVehicle("no-existe@test.com", vehicleId, 5)
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // ======================================
  // HU12_E04 – Vehículo no existe
  // ======================================
  test("HU12_E04 – Vehículo no existe", async () => {
    await expect(
      vehicleService.updateVehicle(email, "vehiculo-inexistente", 5)
    ).rejects.toThrow("VehicleNotFoundError");
  });
});

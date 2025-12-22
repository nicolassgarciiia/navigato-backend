import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU10 – Listado de vehículos (ATDD)", () => {
  let vehicleService: VehicleService;
  let userService: UserService;

  const email = `hu10_${crypto.randomUUID()}@test.com`;
  const password = "ValidPass1!";

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
      apellidos: "HU10",
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
  // HU10_E01 – Escenario válido
  // ======================================
  test("HU10_E01 – Listar vehículos del usuario", async () => {
    const vehicles = await vehicleService.listByUser(email);

    expect(Array.isArray(vehicles)).toBe(true);
  });

  // ======================================
  // HU10_E02 – Usuario no autenticado
  // ======================================
  test("HU10_E02 – Usuario no autenticado", async () => {
    await expect(
      vehicleService.listByUser("no-existe@test.com")
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

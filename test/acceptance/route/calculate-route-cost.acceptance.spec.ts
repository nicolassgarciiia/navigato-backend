import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { VehicleModule } from "../../../src/modules/vehicle/vehicle.module";
import { RouteModule } from "../../../src/modules/route/route.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import { VehicleService } from "../../../src/modules/vehicle/application/vehicle.service";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU14 – Calcular coste de ruta en vehículo (ATDD)", () => {
  let userService: UserService;
  let vehicleService: VehicleService;
  let routeService: RouteService;
  let poiService: POIService;

  const email = `hu14_${crypto.randomUUID()}@test.com`;
  const password = "ValidPass1!";

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, VehicleModule, RouteModule],
    }).compile();

    userService = moduleRef.get(UserService);
    vehicleService = moduleRef.get(VehicleService);
    routeService = moduleRef.get(RouteService);
    poiService = moduleRef.get(POIService);

    // Usuario
    await userService.register({
      nombre: "Usuario",
      apellidos: "HU14",
      correo: email,
      contraseña: password,
      repetirContraseña: password,
      aceptaPoliticaPrivacidad: true,
    });
    // POI
    await poiService.createPOI(email, "Casa", 39.9869, -0.0513);
    await poiService.createPOI(email, "Trabajo", 40.4168, -3.7038);

    // Vehículo
    await vehicleService.createVehicle(
        email,
        "Coche familiar",
        "7750LHF",
        "COMBUSTION",
        6.5
    );


    // Ruta
    await routeService.calculateRoute(
      email,
      "Casa",
      "Trabajo",
      "vehiculo"
    );
  });

  afterAll(async () => {
    await userService.deleteByEmail(email);
  });

  // ======================================
  // HU14_E01 – Escenario válido
  // ======================================
  test("HU14_E01 – Calcula el coste de combustible de una ruta", async () => {
    const cost = await routeService.calculateRouteCostWithVehicle(
      email,
      "Coche familiar"
    );

    expect(cost).toBeDefined();
    expect(cost.tipo).toBe("combustible");
    expect(cost.costeEconomico).toBeGreaterThan(0);
    expect(cost.costeEnergetico.valor).toBeGreaterThan(0);
  });
});

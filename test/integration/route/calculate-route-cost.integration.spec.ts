import { Test } from "@nestjs/testing";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { RouteModule } from "../../../src/modules/route/route.module";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { VehicleRepository } from "../../../src/modules/vehicle/domain/vehicle.repository";
import { POIRepository } from "../../../src/modules/poi/domain/poi.repository";
import { Route } from "../../../src/modules/route/domain/route.entity";

/**
 * ==========================
 * MOCKS
 * ==========================
 */

const userRepositoryMock = {
  findByEmail: jest.fn(),
};

const vehicleRepositoryMock = {
  findByUser: jest.fn(),
};

const poiRepositoryMock = {
  findByUser: jest.fn(),
};

const routingAdapterMock = {
  calculate: jest.fn(),
};

describe("HU14 – Calcular coste de ruta en vehículo (INTEGRATION)", () => {
  let routeService: RouteService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RouteModule],
    })
      .overrideProvider(UserRepository)
      .useValue(userRepositoryMock)
      .overrideProvider(VehicleRepository)
      .useValue(vehicleRepositoryMock)
      .overrideProvider(POIRepository)
      .useValue(poiRepositoryMock)
      .overrideProvider("RoutingAdapter")
      .useValue(routingAdapterMock)
      .compile();

    routeService = moduleRef.get(RouteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  // HU14_E01 – Escenario válido
  // =====================================================
  test("HU14_E01 – Calcula el coste de combustible correctamente", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "usuario@test.com",
    });

    poiRepositoryMock.findByUser.mockResolvedValue([
      { nombre: "Casa", latitud: 39.9, longitud: -0.05 },
      { nombre: "Trabajo", latitud: 40.4, longitud: -3.7 },
    ]);

    routingAdapterMock.calculate.mockResolvedValue(
      new Route({
        id: "route-1",
        distancia: 10000, // 10 km
        duracion: 600,
        metodoMovilidad: "vehiculo",
      })
    );

    vehicleRepositoryMock.findByUser.mockResolvedValue([
      {
        nombre: "Coche familiar",
        consumo: 6.5,
        tipo: "COMBUSTION",
      },
    ]);

    // GIVEN: ruta ya calculada
    await routeService.calculateRoute(
      "usuario@test.com",
      "Casa",
      "Trabajo",
      "vehiculo"
    );

    // WHEN: calculamos coste
    const cost = await routeService.calculateRouteCostWithVehicle(
      "usuario@test.com",
      "Coche familiar"
    );

    // THEN
    expect(cost).toBeDefined();
    expect(cost.tipo).toBe("combustible");
    expect(cost.costeEnergetico.valor).toBeGreaterThan(0);
    expect(cost.costeEconomico).toBeGreaterThan(0);
  });

  // =====================================================
  // HU14_E02 – Vehículo no existe
  // =====================================================
  test("HU14_E02 – Vehículo no existe", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "usuario@test.com",
    });

    vehicleRepositoryMock.findByUser.mockResolvedValue([]);

    await expect(
      routeService.calculateRouteCostWithVehicle(
        "usuario@test.com",
        "Coche inexistente"
      )
    ).rejects.toThrow("VehicleNotFoundError");
  });

  // =====================================================
  // HU14_E03 – Usuario no autenticado
  // =====================================================
  test("HU14_E03 – Usuario no autenticado", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    await expect(
      routeService.calculateRouteCostWithVehicle(
        "no-existe@test.com",
        "Coche familiar"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

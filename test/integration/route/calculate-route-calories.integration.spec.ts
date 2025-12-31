import { Test } from "@nestjs/testing";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { RouteModule } from "../../../src/modules/route/route.module";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
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

const poiRepositoryMock = {
  findByUser: jest.fn(),
};

const routingAdapterMock = {
  calculate: jest.fn(),
};

describe("HU15 – Calcular coste calórico (INTEGRATION)", () => {
  let routeService: RouteService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RouteModule],
    })
      .overrideProvider(UserRepository)
      .useValue(userRepositoryMock)
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
  // HU15_E01 – Escenario válido
  // =====================================================
  test("HU15_E01 – Calcula el coste calórico correctamente", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
    });

    poiRepositoryMock.findByUser.mockResolvedValue([
      { nombre: "Casa", latitud: 39.9, longitud: -0.05 },
      { nombre: "Parque", latitud: 39.91, longitud: -0.06 },
    ]);

    routingAdapterMock.calculate.mockResolvedValue(
      new Route({
        id: "route-1",
        distancia: 6000, // 6 km
        duracion: 1800,
        metodoMovilidad: "pie",
      })
    );

    // GIVEN: ruta calculada
    await routeService.calculateRoute(
      "usuario@test.com",
      "Casa",
      "Parque",
      "pie"
    );

    // WHEN
    const cost = await routeService.calculateRouteCalories(
      "usuario@test.com"
    );

    // THEN
    expect(cost.tipo).toBe("calorias");
    expect(cost.costeEnergetico.valor).toBeGreaterThan(0);
    expect(cost.costeEnergetico.unidad).toBe("kcal");
    expect(cost.costeEconomico).toBeNull();
  });

  // =====================================================
  // HU15_E02 – Usuario no autenticado
  // =====================================================
  test("HU15_E02 – Usuario no autenticado", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    await expect(
      routeService.calculateRouteCalories("no-existe@test.com")
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

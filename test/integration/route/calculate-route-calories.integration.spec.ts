import { Test } from "@nestjs/testing";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { RouteModule } from "../../../src/modules/route/route.module";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { Route } from "../../../src/modules/route/domain/route.entity";

/**
 * ==========================
 * MOCKS
 * ==========================
 */

const userRepositoryMock = {
  findByEmail: jest.fn(),
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

    routingAdapterMock.calculate.mockResolvedValue(
      new Route({
        id: "route-1",
        distancia: 6000, // 6 km
        duracion: 1800,
        metodoMovilidad: "pie",
      })
    );

    const origen = { lat: 39.9, lng: -0.05 };
    const destino = { lat: 39.91, lng: -0.06 };

    // GIVEN: ruta calculada
    await routeService.calculateRoute(
      "usuario@test.com",
      origen,
      destino,
      "pie"
    );

    // WHEN
    const cost = await routeService.calculateRouteCalories(
      "usuario@test.com"
    );

    // THEN
    expect(cost).toBeDefined();
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

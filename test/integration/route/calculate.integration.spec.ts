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

describe("HU13 – Calcular ruta (INTEGRATION)", () => {
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
  // HU13_E01 – Escenario válido
  // =====================================================
  test("HU13_E01 – Calcula la ruta correctamente", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "usuario@test.com",
    });

    routingAdapterMock.calculate.mockResolvedValue(
      new Route({
        id: "route-1",
        distancia: 9550,
        duracion: 730,
        metodoMovilidad: "vehiculo",
      })
    );

    const origen = { lat: 39.9, lng: -0.05 };
    const destino = { lat: 40.4, lng: -3.7 };

    const route = await routeService.calculateRoute(
      "usuario@test.com",
      origen,
      destino,
      "vehiculo"
    );

    expect(userRepositoryMock.findByEmail).toHaveBeenCalledTimes(1);
    expect(routingAdapterMock.calculate).toHaveBeenCalledTimes(1);

    expect(route.distancia).toBe(9550);
    expect(route.duracion).toBe(730);
  });

  // =====================================================
  // HU13_E02 – Lugar inválido (NO se valida en el service)
  // =====================================================
  test("HU13_E02 – Lugar inexistente devuelve ruta igualmente", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "usuario@test.com",
    });

    routingAdapterMock.calculate.mockResolvedValue(
      new Route({
        id: "route-1",
        distancia: 9550,
        duracion: 730,
        metodoMovilidad: "vehiculo",
      })
    );

    const origen = { lat: 39.9, lng: -0.05 };
    const destino = { lat: 0, lng: 0 }; // lugar "inválido" para el test

    const route = await routeService.calculateRoute(
      "usuario@test.com",
      origen,
      destino,
      "vehiculo"
    );

    expect(route).toBeDefined();
    expect(routingAdapterMock.calculate).toHaveBeenCalled();
  });

  // =====================================================
  // HU13_E03 – Usuario no autenticado
  // =====================================================
  test("HU13_E03 – Usuario no autenticado", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    const origen = { lat: 39.9, lng: -0.05 };
    const destino = { lat: 40.4, lng: -3.7 };

    await expect(
      routeService.calculateRoute(
        "no-existe@test.com",
        origen,
        destino,
        "vehiculo"
      )
    ).rejects.toThrow("AuthenticationRequiredError");

    expect(routingAdapterMock.calculate).not.toHaveBeenCalled();
  });
});

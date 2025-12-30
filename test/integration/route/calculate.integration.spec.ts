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

describe("HU13 – Calcular ruta (INTEGRATION)", () => {
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
  // HU13_E01 – Escenario válido
  // =====================================================
  test("HU13_E01 – Calcula la ruta correctamente", async () => {
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
        distancia: 9550,
        duracion: 730,
        metodoMovilidad: "vehiculo",
      })
    );

    const route = await routeService.calculateRoute(
      "usuario@test.com",
      "Casa",
      "Trabajo",
      "vehiculo"
    );

    expect(userRepositoryMock.findByEmail).toHaveBeenCalledTimes(1);
    expect(poiRepositoryMock.findByUser).toHaveBeenCalledWith("user-1");
    expect(routingAdapterMock.calculate).toHaveBeenCalledTimes(1);

    expect(route.distancia).toBe(9550);
    expect(route.duracion).toBe(730);
  });

  // =====================================================
  // HU13_E02 – Lugar inválido
  // =====================================================
  test("HU13_E02 – Lugar inexistente", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "usuario@test.com",
    });

    poiRepositoryMock.findByUser.mockResolvedValue([
      { nombre: "Casa", latitud: 39.9, longitud: -0.05 },
    ]);

    await expect(
      routeService.calculateRoute(
        "usuario@test.com",
        "Casa",
        "Playa",
        "vehiculo"
      )
    ).rejects.toThrow("InvalidPlaceOfInterestError");

    expect(routingAdapterMock.calculate).not.toHaveBeenCalled();
  });

  // =====================================================
  // HU13_E03 – Usuario no autenticado
  // =====================================================
  test("HU13_E03 – Usuario no autenticado", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    await expect(
      routeService.calculateRoute(
        "no-existe@test.com",
        "Casa",
        "Trabajo",
        "vehiculo"
      )
    ).rejects.toThrow("AuthenticationRequiredError");

    expect(poiRepositoryMock.findByUser).not.toHaveBeenCalled();
    expect(routingAdapterMock.calculate).not.toHaveBeenCalled();
  });
});

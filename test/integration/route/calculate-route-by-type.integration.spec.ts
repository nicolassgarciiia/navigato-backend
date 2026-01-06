import { Test } from "@nestjs/testing";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { RouteModule } from "../../../src/modules/route/route.module";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { POIRepository } from "../../../src/modules/poi/domain/poi.repository";
import { UserPreferencesService } from "../../../src/modules/user-preferences/application/user-preferences.service";

describe("HU16 – Calcular ruta por criterio (INTEGRATION)", () => {
  let routeService: RouteService;

  /**
   * ==========================
   * MOCKS
   * ==========================
   */
  const userRepositoryMock = {
    findByEmail: jest.fn(),
  };

  // En HU16 NO se usa POIRepository (en tu service), pero lo dejamos por compatibilidad
  const poiRepositoryMock = {
    findByUser: jest.fn(),
  };

  const userPreferencesServiceMock = {
    getByUser: jest.fn(),
  };

  const routingAdapterMock = {
    calculate: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RouteModule],
    })
      .overrideProvider(UserRepository)
      .useValue(userRepositoryMock)
      .overrideProvider(POIRepository)
      .useValue(poiRepositoryMock)
      .overrideProvider(UserPreferencesService)
      .useValue(userPreferencesServiceMock)
      .overrideProvider("RoutingAdapter")
      .useValue(routingAdapterMock)
      .compile();

    routeService = moduleRef.get(RouteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  // HU16_E01 – Ruta rápida
  // =====================================================
  test("HU16_E01 – Calcula ruta rápida", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({ id: "user-1" });

    userPreferencesServiceMock.getByUser.mockResolvedValue({
      defaultRouteType: "economica",
      defaultVehicleId: null,
    });

    routingAdapterMock.calculate.mockResolvedValue({
      id: "route-1",
      distancia: 1000,
      duracion: 600,
      metodoMovilidad: "vehiculo",
      tipo: undefined,
    });

    const origen = { lat: 39.9, lng: -0.05 };
    const destino = { lat: 40.4, lng: -3.7 };

    const route = await routeService.calculateRouteByType(
      "usuario@test.com",
      origen,
      destino,
      "vehiculo",
      "rapida"
    );

    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith("usuario@test.com");
    expect(userPreferencesServiceMock.getByUser).toHaveBeenCalledWith("usuario@test.com");

    // clave: para "rapida" debe mapear a "fastest"
    expect(routingAdapterMock.calculate).toHaveBeenCalledWith(
      origen,
      destino,
      "vehiculo",
      "fastest"
    );

    expect(route.tipo).toBe("rapida");
  });

  // =====================================================
  // HU16_E02 – Ruta corta
  // =====================================================
  test("HU16_E02 – Calcula ruta corta", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({ id: "user-1" });

    userPreferencesServiceMock.getByUser.mockResolvedValue({
      defaultRouteType: "economica",
      defaultVehicleId: null,
    });

    routingAdapterMock.calculate.mockResolvedValue({
      id: "route-1",
      distancia: 900,
      duracion: 700,
      metodoMovilidad: "vehiculo",
      tipo: undefined,
    });

    const origen = { lat: 39.9, lng: -0.05 };
    const destino = { lat: 40.4, lng: -3.7 };

    const route = await routeService.calculateRouteByType(
      "usuario@test.com",
      origen,
      destino,
      "vehiculo",
      "corta"
    );

    // clave: para "corta" debe mapear a "shortest"
    expect(routingAdapterMock.calculate).toHaveBeenCalledWith(
      origen,
      destino,
      "vehiculo",
      "shortest"
    );

    expect(route.tipo).toBe("corta");
  });

  // =====================================================
  // HU16_E03 – Usuario no autenticado
  // =====================================================
  test("HU16_E03 – Usuario no autenticado", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    const origen = { lat: 39.9, lng: -0.05 };
    const destino = { lat: 40.4, lng: -3.7 };

    await expect(
      routeService.calculateRouteByType(
        "no-existe@test.com",
        origen,
        destino,
        "vehiculo",
        "rapida"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

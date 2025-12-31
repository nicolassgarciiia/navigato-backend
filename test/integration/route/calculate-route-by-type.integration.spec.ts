import { Test } from "@nestjs/testing";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { RouteModule } from "../../../src/modules/route/route.module";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { POIRepository } from "../../../src/modules/poi/domain/poi.repository";

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

describe("HU16 – Calcular ruta por criterio (INTEGRATION)", () => {
  let routeService: RouteService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RouteModule],
    })
      .overrideProvider(UserRepository)
      .useValue(userRepositoryMock)
      .overrideProvider(POIRepository)
      .useValue(poiRepositoryMock)
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
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
    });

    poiRepositoryMock.findByUser.mockResolvedValue([
      { nombre: "Casa", latitud: 39.9, longitud: -0.05 },
      { nombre: "Trabajo", latitud: 40.4, longitud: -3.7 },
    ]);

    const route = await routeService.calculateRouteByType(
      "usuario@test.com",
      "Casa",
      "Trabajo",
      "vehiculo",
      "rapida"
    );

    expect(route.tipo).toBe("rapida");
  });

  // =====================================================
  // HU16_E02 – Ruta corta
  // =====================================================
  test("HU16_E02 – Calcula ruta corta", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
    });

    poiRepositoryMock.findByUser.mockResolvedValue([
      { nombre: "Casa", latitud: 39.9, longitud: -0.05 },
      { nombre: "Trabajo", latitud: 40.4, longitud: -3.7 },
    ]);

    const route = await routeService.calculateRouteByType(
      "usuario@test.com",
      "Casa",
      "Trabajo",
      "vehiculo",
      "corta"
    );

    expect(route.tipo).toBe("corta");
  });

  // =====================================================
  // HU16_E03 – Usuario no autenticado
  // =====================================================
  test("HU16_E03 – Usuario no autenticado", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    await expect(
      routeService.calculateRouteByType(
        "no-existe@test.com",
        "Casa",
        "Trabajo",
        "vehiculo",
        "rapida"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

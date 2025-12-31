import { Test } from "@nestjs/testing";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { RouteModule } from "../../../src/modules/route/route.module";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { RouteRepository } from "../../../src/modules/route/domain/route.repository";
import { Route } from "../../../src/modules/route/domain/route.entity";

/**
 * ==========================
 * MOCKS
 * ==========================
 */

const userRepositoryMock = {
  findByEmail: jest.fn(),
};

const routeRepositoryMock = {
  findByName: jest.fn(),
  save: jest.fn(),
};

describe("HU17 – Guardar ruta (INTEGRATION)", () => {
  let routeService: RouteService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RouteModule],
    })
      .overrideProvider(UserRepository)
      .useValue(userRepositoryMock)
      .overrideProvider(RouteRepository)
      .useValue(routeRepositoryMock)
      .compile();

    routeService = moduleRef.get(RouteService);

    // simulamos que ya hay una ruta calculada
    (routeService as any).lastCalculatedRoute = new Route({
      id: "route-1",
      distancia: 10000,
      duracion: 600,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  // HU17_E01 – Escenario válido
  // =====================================================
  test("HU17_E01 – Guarda la ruta correctamente", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({ id: "user-1" });
    routeRepositoryMock.findByName.mockResolvedValue(null);
    routeRepositoryMock.save.mockResolvedValue(undefined);

    const saved = await routeService.saveRoute(
      "usuario@test.com",
      "Ruta al trabajo"
    );

    expect(routeRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(saved.nombre).toBe("Ruta al trabajo");
    expect(saved.favorito).toBe(false);
  });
});

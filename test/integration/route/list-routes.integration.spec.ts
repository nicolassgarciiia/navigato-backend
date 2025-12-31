import { Test } from "@nestjs/testing";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { RouteModule } from "../../../src/modules/route/route.module";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { RouteRepository } from "../../../src/modules/route/domain/route.repository";

/**
 * ==========================
 * MOCKS
 * ==========================
 */

const userRepositoryMock = {
  findByEmail: jest.fn(),
};

const routeRepositoryMock = {
  findByUser: jest.fn(),
};

describe("HU18 – Listar rutas (INTEGRATION)", () => {
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  // HU18_E01 – Escenario válido
  // =====================================================
  test("HU18_E01 – Lista rutas del usuario", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({ id: "user-1" });
    routeRepositoryMock.findByUser.mockResolvedValue([]);

    const routes = await routeService.listSavedRoutes(
      "usuario@test.com"
    );

    expect(Array.isArray(routes)).toBe(true);
    expect(routeRepositoryMock.findByUser).toHaveBeenCalledWith("user-1");
  });
});

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
  findByName: jest.fn(),
  delete: jest.fn(),
};

describe("HU19 – Eliminar ruta (INTEGRATION)", () => {
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
  // HU19_E01 – Escenario válido
  // =====================================================
  test("HU19_E01 – Elimina la ruta correctamente", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({ id: "user-1" });
    routeRepositoryMock.findByName.mockResolvedValue({
      nombre: "Ruta al trabajo",
    });
    routeRepositoryMock.delete.mockResolvedValue(undefined);

    await routeService.deleteSavedRoute(
      "usuario@test.com",
      "Ruta al trabajo"
    );

    expect(routeRepositoryMock.delete).toHaveBeenCalledWith(
      "user-1",
      "Ruta al trabajo"
    );
  });
});

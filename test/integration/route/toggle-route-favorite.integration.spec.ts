import { Test, TestingModule } from "@nestjs/testing";
import { RouteService } from "../../../src/modules/route/application/route.service";
import { RouteRepository } from "../../../src/modules/route/domain/route.repository"; // Ajusta la ruta
import { TEST_EMAIL } from "../../helpers/test-constants";

describe("HU20 – Marcar ruta como favorita (Mocks)", () => {
  let routeService: RouteService;

  // Mock ajustado a tu RouteRepository
  const mockRouteRepository = {
    findByName: jest.fn(),
    save: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: RouteRepository, useValue: mockRouteRepository },
      ],
    }).compile();

    routeService = module.get<RouteService>(RouteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("HU20_E01 – Debe marcar la ruta como favorita", async () => {
    // GIVEN: Una ruta que existe y no es favorita
    const nombreRuta = "Ruta al trabajo";
    const mockRoute = { nombre: nombreRuta, favorito: false };
    
    mockRouteRepository.findByName.mockResolvedValue(mockRoute);

    // WHEN: Hacemos el toggle
    await routeService.toggleRouteFavorite(TEST_EMAIL, nombreRuta);

    // THEN: Verificamos que buscó por usuario y nombre
    expect(mockRouteRepository.findByName).toHaveBeenCalledWith(TEST_EMAIL, nombreRuta);
    
    // Verificamos que guardó los cambios (favorito: true)
    expect(mockRouteRepository.save).toHaveBeenCalledWith(
      TEST_EMAIL,
      expect.objectContaining({ favorito: true })
    );
  });

  test("HU20_E02 – Error si la ruta no existe", async () => {
    mockRouteRepository.findByName.mockResolvedValue(null);

    await expect(
      routeService.toggleRouteFavorite(TEST_EMAIL, "Ruta Inexistente")
    ).rejects.toThrow("SavedRouteNotFoundError");
  });
});
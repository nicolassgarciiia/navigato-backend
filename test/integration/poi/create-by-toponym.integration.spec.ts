import { Test } from "@nestjs/testing";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { POIRepository } from "../../../src/modules/poi/domain/poi.repository";
import { GeocodingService } from "../../../src/modules/geocoding/application/geocoding.service";

describe("HU06 – Alta de POI por topónimo (INTEGRATION - mocks)", () => {
  let poiService: POIService;

  const email = "hu06_integration@test.com";

  // ===== MOCKS =====
  const mockUser = {
    id: 202,
    nombre: "Usuario Integracion",
    correo: email,
    listaLugares: [],
  };

  const mockUserRepository = {
    findByEmail: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    deleteByEmail: jest.fn(),
  };

  const mockPOIRepository = {
    findByUserAndName: jest.fn(),
    save: jest.fn(),
  };

  const mockGeocodingService = {
    getCoordinatesFromToponym: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [POIModule],
    })
      .overrideProvider(UserRepository)
      .useValue(mockUserRepository)
      .overrideProvider(POIRepository)
      .useValue(mockPOIRepository)
      .overrideProvider(GeocodingService)
      .useValue(mockGeocodingService)
      .compile();

    poiService = moduleRef.get(POIService);

    jest.clearAllMocks();

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockPOIRepository.findByUserAndName.mockResolvedValue(null);
    mockGeocodingService.getCoordinatesFromToponym.mockResolvedValue({
      latitud: 48.8584,
      longitud: 2.2945,
    });
    mockPOIRepository.save.mockResolvedValue(undefined);
  });

  // ======================================
  // HU06_E01 – Escenario válido
  // ======================================
  test("HU06_E01 – Alta de POI por topónimo válida", async () => {
    const poi = await poiService.createByToponym(
      email,
      "Recuerdo de París",
      "Torre Eiffel, París, Francia"
    );

    expect(poi).toBeDefined();
    expect(poi.nombre).toBe("Recuerdo de París");
    expect(poi.toponimo).toContain("París");
    expect(poi.latitud).toBeCloseTo(48.8584, 1);
    expect(poi.longitud).toBeCloseTo(2.2945, 1);
    expect(poi.favorito).toBe(false);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(mockPOIRepository.findByUserAndName).toHaveBeenCalledTimes(1);
    expect(
      mockGeocodingService.getCoordinatesFromToponym
    ).toHaveBeenCalledTimes(1);
    expect(mockPOIRepository.save).toHaveBeenCalledTimes(1);
  });

  // ======================================
  // HU06_E04 – Usuario no autenticado
  // ======================================
  test("HU06_E04 – Usuario no autenticado", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      poiService.createByToponym(
        "no-existe@test.com",
        "Lugar",
        "Madrid"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // ======================================
  // HU06_E06 – Nombre repetido
  // ======================================
  test("HU06_E06 – Nombre de POI repetido", async () => {
    mockPOIRepository.findByUserAndName.mockResolvedValueOnce({
      id: "poi-existente",
      nombre: "Mi Lugar Favorito",
    });

    await expect(
      poiService.createByToponym(
        email,
        "Mi Lugar Favorito",
        "Barcelona"
      )
    ).rejects.toThrow("DuplicatePOINameError");
  });
});

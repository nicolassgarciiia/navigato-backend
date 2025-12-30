import { Test } from "@nestjs/testing";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { POIRepository } from "../../../src/modules/poi/domain/poi.repository";
import { GeocodingService } from "../../../src/modules/geocoding/application/geocoding.service";

describe("HU05 – Alta de POI con coordenadas (INTEGRATION - mocks)", () => {
  let poiService: POIService;

  const email = `hu05_${crypto.randomUUID()}@test.com`;

  // ===== MOCKS =====
  const mockUser = {
    id: 101,
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
    getToponimo: jest.fn(),
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
    mockGeocodingService.getToponimo.mockResolvedValue(
      "Calle Falsa 123, Ciudad Test"
    );
    mockPOIRepository.save.mockResolvedValue(undefined);
  });

  // ======================================
  // HU05_E01 – Escenario válido
  // ======================================
  test("HU05_E01 – Alta de POI con coordenadas válidas", async () => {
    const poi = await poiService.createPOI(
      email,
      "Casa",
      39.9869,
      -0.0513
    );

    expect(poi).toBeDefined();
    expect(poi.nombre).toBe("Casa");
    expect(poi.latitud).toBe(39.9869);
    expect(poi.longitud).toBe(-0.0513);
    expect(poi.toponimo).toBeDefined();
    expect(poi.favorito).toBe(false);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(mockPOIRepository.findByUserAndName).toHaveBeenCalledTimes(1);
    expect(mockGeocodingService.getToponimo).toHaveBeenCalledTimes(1);
    expect(mockPOIRepository.save).toHaveBeenCalledTimes(1);
  });

  // ======================================
  // HU05_E02 – Coordenadas inválidas
  // ======================================
  test("HU05_E02 – Coordenadas fuera de rango", async () => {
    await expect(
      poiService.createPOI(
        email,
        "Trabajo",
        120.5432,
        -250.0021
      )
    ).rejects.toThrow("InvalidCoordinatesFormatError");
  });

  // ======================================
  // HU05_E04 – Nombre inválido
  // ======================================
  test("HU05_E04 – Nombre inválido", async () => {
    await expect(
      poiService.createPOI(
        email,
        "Ca",
        39.9,
        -0.05
      )
    ).rejects.toThrow("InvalidPOINameError");
  });

  // ======================================
  // HU05_E05 – Usuario no autenticado
  // ======================================
  test("HU05_E05 – Usuario no autenticado", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      poiService.createPOI(
        "no-existe@test.com",
        "Casa",
        39.9,
        -0.05
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

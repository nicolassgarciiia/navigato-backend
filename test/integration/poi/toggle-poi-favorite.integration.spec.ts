import { Test, TestingModule } from "@nestjs/testing";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { TEST_EMAIL } from "../../helpers/test-constants";

describe("HU20 – Marcar POI como favorito (Mocks)", () => {
  let poiService: POIService;

  // Mock del Repositorio
  const mockPoiRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        POIService,
        { provide: "POI_REPOSITORY", useValue: mockPoiRepository },
      ],
    }).compile();

    poiService = module.get<POIService>(POIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("HU20_E01 – Debe marcar un POI como favorito", async () => {
    const mockPoi = { id: "poi-123", nombre: "Casa", favorito: false };
    mockPoiRepository.findById.mockResolvedValue(mockPoi);
    mockPoiRepository.save.mockResolvedValue({ ...mockPoi, favorito: true });

    await poiService.togglePoiFavorite(TEST_EMAIL, "poi-123");

    expect(mockPoiRepository.findById).toHaveBeenCalledWith("poi-123");
    expect(mockPoiRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ favorito: true })
    );
  });

  test("HU20_E02 – Error si el POI no existe", async () => {
    mockPoiRepository.findById.mockResolvedValue(null);

    await expect(
      poiService.togglePoiFavorite(TEST_EMAIL, "inexistente")
    ).rejects.toThrow("PlaceOfInterestNotFoundError");
  });

  test("HU20_E05 – Debe desmarcar un POI que ya era favorito", async () => {
    const mockPoi = { id: "poi-123", nombre: "Trabajo", favorito: true };
    mockPoiRepository.findById.mockResolvedValue(mockPoi);

    await poiService.togglePoiFavorite(TEST_EMAIL, "poi-123");

    expect(mockPoiRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ favorito: false })
    );
  });
});
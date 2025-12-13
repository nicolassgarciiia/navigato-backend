import { Test } from "@nestjs/testing";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";

describe("HU05 – Alta de POI con coordenadas (ATDD)", () => {
  let service: POIService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [POIModule],
    }).compile();

    service = moduleRef.get(POIService);
  });

  // ======================================
  // HU05_E01 – Escenario válido
  // ======================================
  test("HU05_E01 – Alta de POI con coordenadas válidas", async () => {
    const poi = await service.createPOI(
      "usuario@ejemplo.com",
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
  });

  // ======================================
  // HU05_E02 – Coordenadas inválidas
  // ======================================
  test("HU05_E02 – Coordenadas fuera de rango", async () => {
    await expect(
      service.createPOI(
        "usuario@ejemplo.com",
        "Trabajo",
        120.5432,
        -250.0021
      )
    ).rejects.toThrow("InvalidCoordinatesFormatError");
  });

  // ======================================
  // HU05_E04 – Nombre inválido
  // ======================================
  test("HU05_E04 – Nombre inválido (< 3 caracteres)", async () => {
    await expect(
      service.createPOI(
        "usuario@ejemplo.com",
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
    await expect(
      service.createPOI(
        "no-existe@ejemplo.com",
        "Casa",
        39.9,
        -0.05
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

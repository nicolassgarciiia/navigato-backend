import { POIService } from "../../../src/modules/poi/application/poi.service";
import { POIRepository } from "../../../src/modules/poi/domain/poi.repository";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { GeocodingService } from "../../../src/modules/geocoding/application/geocoding.service";
import { POI } from "../../../src/modules/poi/domain/poi.entity";

import {
  AuthenticationRequiredError,
  PlaceOfInterestNotFoundError,
} from ".../../../src/modules/poi/domain/errors";

describe("HU20 – Marcar POI como favorito", () => {
  let service: POIService;

  let poiRepository: jest.Mocked<POIRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let geocodingService: jest.Mocked<GeocodingService>;

  const EMAIL = "test@test.com";
  const USER_ID = "user-123";
  const POI_ID = "poi-123";

  beforeEach(() => {
    poiRepository = {
      save: jest.fn(),
      findByUserAndName: jest.fn(),
      findByUser: jest.fn(),
      findByIdAndUser: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as any;

    userRepository = {
      findByEmail: jest.fn(),
    } as any;

    geocodingService = {
      getToponimo: jest.fn(),
      getCoordinatesFromToponym: jest.fn(),
    } as any;

    service = new POIService(
      poiRepository,
      userRepository,
      geocodingService
    );
  });

  // ==================================================
  // HU20_E01 – Marcar POI como favorito
  // ==================================================
  test("HU20_E01 – Debe marcar un POI como favorito", async () => {
    // GIVEN: usuario autenticado
    userRepository.findByEmail.mockResolvedValue({ id: USER_ID } as any);

    // POI mockeado (sin constructor)
    const fakePoi: POI = {
      id: POI_ID,
      nombre: "Casa",
      latitud: 41.38,
      longitud: 2.17,
      toponimo: "Barcelona",
      favorito: false,
    };

    poiRepository.findByIdAndUser.mockResolvedValue(fakePoi);

    // WHEN
    await service.togglePoiFavorite(EMAIL, POI_ID);

    // THEN
    expect(fakePoi.favorito).toBe(true);
    expect(poiRepository.update).toHaveBeenCalledWith(fakePoi);
  });

  // ==================================================
  // HU20_E02 – POI no existe
  // ==================================================
  test("HU20_E02 – Error si el POI no existe", async () => {
    userRepository.findByEmail.mockResolvedValue({ id: USER_ID } as any);
    poiRepository.findByIdAndUser.mockResolvedValue(null);

    await expect(
      service.togglePoiFavorite(EMAIL, POI_ID)
    ).rejects.toBeInstanceOf(PlaceOfInterestNotFoundError);
  });

  // ==================================================
  // HU20_E03 – Usuario no autenticado
  // ==================================================
  test("HU20_E03 – Error si el usuario no está autenticado", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.togglePoiFavorite(EMAIL, POI_ID)
    ).rejects.toBeInstanceOf(AuthenticationRequiredError);
  });

  // ==================================================
  // HU20_E05 – Desmarcar POI favorito
  // ==================================================
  test("HU20_E05 – Debe desmarcar un POI que ya era favorito", async () => {
    userRepository.findByEmail.mockResolvedValue({ id: USER_ID } as any);

    const fakePoi: POI = {
      id: POI_ID,
      nombre: "Trabajo",
      latitud: 41.39,
      longitud: 2.18,
      toponimo: "Barcelona",
      favorito: true,
    };

    poiRepository.findByIdAndUser.mockResolvedValue(fakePoi);

    await service.togglePoiFavorite(EMAIL, POI_ID);

    expect(fakePoi.favorito).toBe(false);
    expect(poiRepository.update).toHaveBeenCalledWith(fakePoi);
  });
});

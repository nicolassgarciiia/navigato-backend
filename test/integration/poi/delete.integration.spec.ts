import { Test } from "@nestjs/testing";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { POIRepository } from "../../../src/modules/poi/domain/poi.repository";
import { AuthenticationRequiredError, PlaceOfInterestNotFoundError, DatabaseConnectionError } from "../../../src/modules/poi/domain/errors"
import { POI } from "../../../src/modules/poi/domain/poi.entity";
import { GeocodingService } from "../../../src/modules/geocoding/application/geocoding.service";
describe("HU08 – Delete POI (Integration)", () => {
  let poiService: POIService;
  let userRepository: jest.Mocked<UserRepository>;
  let poiRepository: jest.Mocked<POIRepository>;

  const USER_EMAIL = "user@test.com";
  const USER_ID = "user-123";
  const POI_ID = "poi-456";

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
  providers: [
    POIService,
    {
      provide: UserRepository,
      useValue: {
        findByEmail: jest.fn(),
      },
    },
    {
      provide: POIRepository,
      useValue: {
        findByIdAndUser: jest.fn(),
        delete: jest.fn(),
      },
    },
    {
      provide: GeocodingService,
      useValue: {},
    },
  ],
}).compile();


    poiService = moduleRef.get(POIService);
    userRepository = moduleRef.get(UserRepository);
    poiRepository = moduleRef.get(POIRepository);
  });

  // ======================================================
  // HU08_E01 – Eliminación exitosa
  // ======================================================
  it("HU08_E01 – deletes POI successfully", async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: USER_ID,
    } as any);

    poiRepository.findByIdAndUser.mockResolvedValue(
      new POI({
        id: POI_ID,
        nombre: "Casa",
        latitud: 1,
        longitud: 1,
        toponimo: "Casa",
        favorito: false,
      })
    );

    poiRepository.delete.mockResolvedValue();

    await poiService.deletePOI(USER_EMAIL, POI_ID);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(USER_EMAIL);
    expect(poiRepository.findByIdAndUser).toHaveBeenCalledWith(
      POI_ID,
      USER_ID
    );
    expect(poiRepository.delete).toHaveBeenCalledWith(POI_ID);
  });

  // ======================================================
  // HU08_E02 – Lugar no existe
  // ======================================================
  it("HU08_E02 – throws PlaceOfInterestNotFoundError when POI does not exist", async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: USER_ID,
    } as any);

    poiRepository.findByIdAndUser.mockResolvedValue(null);

    await expect(
      poiService.deletePOI(USER_EMAIL, POI_ID)
    ).rejects.toThrow(PlaceOfInterestNotFoundError);

    expect(poiRepository.delete).not.toHaveBeenCalled();
  });

  // ======================================================
  // HU08_E04 – Usuario no autenticado
  // ======================================================
  it("HU08_E04 – throws AuthenticationRequiredError when user does not exist", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      poiService.deletePOI(USER_EMAIL, POI_ID)
    ).rejects.toThrow(AuthenticationRequiredError);

    expect(poiRepository.findByIdAndUser).not.toHaveBeenCalled();
    expect(poiRepository.delete).not.toHaveBeenCalled();
  });

  // ======================================================
  // HU08_E06 – Fallo de conexión con la base de datos
  // ======================================================
  it("HU08_E06 – throws DatabaseConnectionError when repository delete fails", async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: USER_ID,
    } as any);

    poiRepository.findByIdAndUser.mockResolvedValue(
      new POI({
        id: POI_ID,
        nombre: "Casa",
        latitud: 1,
        longitud: 1,
        toponimo: "Casa",
        favorito: false,
      })
    );

    poiRepository.delete.mockRejectedValue(new Error("DB error"));

    await expect(
      poiService.deletePOI(USER_EMAIL, POI_ID)
    ).rejects.toThrow(DatabaseConnectionError);
  });
});

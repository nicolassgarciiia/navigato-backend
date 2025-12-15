import { Test } from "@nestjs/testing";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import { GeocodingService } from "../../../src/modules/geocoding/application/geocoding.service";
import { POIRepository } from "../../../src/modules/poi/domain/poi.repository";
import * as crypto from "crypto";

/**
 * ==========================
 * MOCKS
 * ==========================
 */

const geocodingServiceMock = {
  getCoordinatesFromToponym: jest.fn().mockResolvedValue({
    latitud: 48.8584,
    longitud: 2.2945,
  }),
};

// Repositorios en memoria
const users: any[] = [];
const pois: any[] = [];

const userRepositoryMock = {
  findByEmail: jest.fn((email: string) =>
    users.find((u) => u.email === email)
  ),
  save: jest.fn((user) => {
    users.push(user);
    return user;
  }),
  deleteByEmail: jest.fn((email: string) => {
    const index = users.findIndex((u) => u.email === email);
    if (index !== -1) users.splice(index, 1);
  }),
};

const poiRepositoryMock = {
  findByUserAndName: jest.fn((userId: string, name: string) =>
    pois.find((p) => p.userId === userId && p.nombre === name)
  ),
  save: jest.fn((poi, userId: string) => {
    pois.push({ ...poi, userId });
    return poi;
  }),
};

/**
 * ==========================
 * TEST
 * ==========================
 */

describe("HU06 – Alta de POI por topónimo (INTEGRATION)", () => {
  let poiService: POIService;
  let userService: UserService;

  const email = `hu06_${crypto.randomUUID()}@test.com`;
  const password = "ValidPass1!";

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule],
    })
      .overrideProvider(GeocodingService)
      .useValue(geocodingServiceMock)
      .overrideProvider("UserRepository")
      .useValue(userRepositoryMock)
      .overrideProvider(POIRepository)
      .useValue(poiRepositoryMock)
      .compile();

    poiService = moduleRef.get(POIService);
    userService = moduleRef.get(UserService);

    // GIVEN: usuario registrado
    const user = await userService.register({
      nombre: "Usuario García Edo",
      apellidos: "HU06",
      correo: email,
      contraseña: password,
      repetirContraseña: password,
      aceptaPoliticaPrivacidad: true,
    });

    // Guardamos el usuario con id (necesario para el repo)
    users.push({
      id: user.id,
      email,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    users.length = 0;
    pois.length = 0;
  });

  // =====================================================
  // HU06_E01 – Alta por topónimo exitosa
  // =====================================================
  test("HU06_E01 – Alta por topónimo exitosa", async () => {
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

    expect(
      geocodingServiceMock.getCoordinatesFromToponym
    ).toHaveBeenCalledWith("Torre Eiffel, París, Francia");

    expect(poiRepositoryMock.save).toHaveBeenCalled();
  });

  // =====================================================
  // HU06_E04 – Usuario no autenticado
  // =====================================================
  test("HU06_E04 – Usuario no autenticado", async () => {
    await expect(
      poiService.createByToponym(
        "no-existe@test.com",
        "Lugar",
        "Madrid"
      )
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // =====================================================
  // HU06_E06 – Nombre de POI repetido
  // =====================================================
  test("HU06_E06 – Nombre de POI repetido para el mismo usuario", async () => {
    await poiService.createByToponym(
      email,
      "Mi Lugar Favorito",
      "Madrid"
    );

    await expect(
      poiService.createByToponym(
        email,
        "Mi Lugar Favorito",
        "Barcelona"
      )
    ).rejects.toThrow("DuplicatePOINameError");
  });
});

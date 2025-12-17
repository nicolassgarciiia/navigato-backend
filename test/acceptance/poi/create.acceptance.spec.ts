import { Test } from "@nestjs/testing";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU05 – Alta de POI con coordenadas (ATDD)", () => {
  let poiService: POIService;
  let userService: UserService;

  const email = `hu05_${crypto.randomUUID()}@test.com`;
  const password = "ValidPass1!";

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule],
    }).compile();

    poiService = moduleRef.get(POIService);
    userService = moduleRef.get(UserService);

    await userService.register({
      nombre: "Usuario",
      apellidos: "HU05",
      correo: email,
      contraseña: password,
      repetirContraseña: password,
      aceptaPoliticaPrivacidad: true,
    });

  });

  afterAll(async () => {
    await userService.deleteByEmail(email);
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

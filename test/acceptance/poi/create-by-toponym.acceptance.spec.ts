import { Test } from "@nestjs/testing";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

describe("HU06 – Alta de POI por topónimo", () => {
  let poiService: POIService;
  let userService: UserService;

  const email = `hu06_${crypto.randomUUID()}@test.com`;
  const password = "ValidPass1!";

  // ==========================
  // SETUP
  // ==========================
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule],
    }).compile();

    poiService = moduleRef.get(POIService);
    userService = moduleRef.get(UserService);

    // GIVEN: Usuario registrado
    await userService.register({
      nombre: "Usuario García Edo",
      apellidos: "HU06",
      correo: email,
      contraseña: password,
      repetirContraseña: password,
      aceptaPoliticaPrivacidad: true,
    });
  });

  afterAll(async () => {
    await userService.deleteByEmail(email);
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
    expect(poi.toponimo).toContain("Eiffel"); 
    expect(poi.latitud).toBeCloseTo(48.8584, 1);
    expect(poi.longitud).toBeCloseTo(2.2945, 1);
    expect(poi.favorito).toBe(false);
  });

  // =====================================================
  // HU06_E04 – Sesión no iniciada
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

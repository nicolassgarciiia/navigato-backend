import { Test } from "@nestjs/testing";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { UserModule } from "../../../src/modules/user/user.module";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as crypto from "crypto";

describe("HU07 – Consulta de lista de lugares de interés (ACCEPTANCE)", () => {
  let poiService: POIService;
  let userService: UserService;

  const password = "ValidPass1!";

  let emailConLugares: string;
  let emailSinLugares: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule],
    }).compile();

    poiService = moduleRef.get(POIService);
    userService = moduleRef.get(UserService);

    // Usuario CON lugares
    emailConLugares = `hu07_${crypto.randomUUID()}@test.com`;

    await userService.register({
      nombre: "Usuario García Edo",
      apellidos: "HU07",
      correo: emailConLugares,
      contraseña: password,
      repetirContraseña: password,
      aceptaPoliticaPrivacidad: true,
    });

    await poiService.createPOI(emailConLugares, "Casa", 39.9869, -0.0513);
    await poiService.createPOI(emailConLugares, "Trabajo", 40.4168, -3.7038);
    await poiService.createPOI(emailConLugares, "Gimnasio", 39.4699, -0.3763);

    // Usuario SIN lugares
    emailSinLugares = `hu07_empty_${crypto.randomUUID()}@test.com`;

    await userService.register({
      nombre: "Usuario Sin Lugares",
      apellidos: "HU07",
      correo: emailSinLugares,
      contraseña: password,
      repetirContraseña: password,
      aceptaPoliticaPrivacidad: true,
    });
  });

  // =====================================================
  // HU07_E01 – Consulta con lugares existentes
  // =====================================================
  test("HU07_E01 – Usuario autenticado consulta su lista con lugares existentes", async () => {
    const lista = await poiService.listByUser(emailConLugares);

    expect(Array.isArray(lista)).toBe(true);
    expect(lista).toHaveLength(3);

    const nombres = lista.map((p: any) => p.nombre);
    expect(nombres).toEqual(expect.arrayContaining(["Casa", "Trabajo", "Gimnasio"]));
  });

  // =====================================================
  // HU07_E02 – Consulta sin lugares existentes
  // =====================================================
  test("HU07_E02 – Usuario autenticado sin lugares obtiene lista vacía", async () => {
    const lista = await poiService.listByUser(emailSinLugares);

    expect(lista).toEqual([]);
  });

  // =====================================================
  // HU07_E03 – Intento sin iniciar sesión
  // =====================================================
  test("HU07_E03 – Usuario no autenticado no puede consultar la lista", async () => {
    await expect(
      poiService.listByUser("anonimo@ejemplo.com")
    ).rejects.toThrow("AuthenticationRequiredError");
  });
});

import { Test } from "@nestjs/testing";
import { POIService } from "../../../src/modules/poi/application/poi.service";
import { POIModule } from "../../../src/modules/poi/poi.module";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import { POIRepository } from "../../../src/modules/poi/domain/poi.repository";
import { UserRepository } from "../../../src/modules/user/domain/user.repository";

/**
 * ==========================
 * MOCKS
 * ==========================
 */

const userRepositoryMock = {
  findByEmail: jest.fn(),
};

const poiRepositoryMock = {
  findByUser: jest.fn(),
};

describe("HU07 – Consulta de lista de lugares (INTEGRATION)", () => {
  let poiService: POIService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, POIModule],
    })
      .overrideProvider(UserRepository)
      .useValue(userRepositoryMock)
      .overrideProvider(POIRepository)
      .useValue(poiRepositoryMock)
      .compile();

    poiService = moduleRef.get(POIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  // HU07_E01 – Usuario con lugares existentes
  // =====================================================
  test("HU07_E01 – Devuelve la lista de lugares del usuario", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "usuario@test.com",
    });

    poiRepositoryMock.findByUser.mockResolvedValue([
      { id: "1", nombre: "Casa" },
      { id: "2", nombre: "Trabajo" },
      { id: "3", nombre: "Gimnasio" },
    ]);

    const result = await poiService.listByUser("usuario@test.com");

    expect(result).toHaveLength(3);
    expect(poiRepositoryMock.findByUser).toHaveBeenCalledWith("user-1");
  });

  // =====================================================
  // HU07_E02 – Usuario sin lugares
  // =====================================================
  test("HU07_E02 – Devuelve lista vacía si no hay lugares", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "usuario@test.com",
    });

    poiRepositoryMock.findByUser.mockResolvedValue([]);

    const result = await poiService.listByUser("usuario@test.com");

    expect(result).toEqual([]);
  });

  // =====================================================
  // HU07_E03 – Usuario no autenticado
  // =====================================================
  test("HU07_E03 – Lanza AuthenticationRequiredError si el usuario no existe", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    await expect(
      poiService.listByUser("anonimo@test.com")
    ).rejects.toThrow("AuthenticationRequiredError");
  });

  // =====================================================
  // HU07_E04 – Error de conexión con BD
  // =====================================================
  test("HU07_E04 – Error de BD lanza DatabaseConnectionError", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "usuario@test.com",
    });

    poiRepositoryMock.findByUser.mockRejectedValue(new Error("DB error"));

    await expect(
      poiService.listByUser("usuario@test.com")
    ).rejects.toThrow("DatabaseConnectionError");
  });
});

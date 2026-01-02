import { Test } from "@nestjs/testing";
import { AppStateService } from "../../../src/modules/app-state/application/app-state.service";
import { PersistenceAccessError } from "../../../src/modules/app-state/domain/errors";

import { UserRepository } from "../../../src/modules/user/domain/user.repository";
import { VehicleRepository } from "../../../src/modules/vehicle/domain/vehicle.repository";
import { POIRepository } from "../../../src/modules/poi/domain/poi.repository";
import { RouteRepository } from "../../../src/modules/route/domain/route.repository";
import { UserPreferencesRepository } from "../../../src/modules/user-preferences/domain/user-preferences.repository";

describe("HU23 – Restaurar estado de la aplicación (INTEGRATION)", () => {
  let service: AppStateService;

  const userRepositoryMock = {
    findByEmail: jest.fn(),
  };

  const vehicleRepositoryMock = {
    findByUser: jest.fn(),
  };

  const poiRepositoryMock = {
    findByUser: jest.fn(),
  };

  const routeRepositoryMock = {
    findByUser: jest.fn(),
  };

  const preferencesRepositoryMock = {
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AppStateService,
        { provide: UserRepository, useValue: userRepositoryMock },
        { provide: VehicleRepository, useValue: vehicleRepositoryMock },
        { provide: POIRepository, useValue: poiRepositoryMock },
        { provide: RouteRepository, useValue: routeRepositoryMock },
        {
          provide: UserPreferencesRepository,
          useValue: preferencesRepositoryMock,
        },
      ],
    }).compile();

    service = moduleRef.get(AppStateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================================================
  // HU23_E01 – Escenario válido
  // ==================================================
  test("HU23_E01 – Restaura correctamente el estado del usuario", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      id: "user-1",
      correo: "usuario@test.com",
      nombre: "Usuario",
      apellidos: "García Edo",
    });

    vehicleRepositoryMock.findByUser.mockResolvedValue([{ id: "v1" }]);
    poiRepositoryMock.findByUser.mockResolvedValue([{ id: "p1" }]);
    routeRepositoryMock.findByUser.mockResolvedValue([{ id: "r1" }]);
    preferencesRepositoryMock.findByUserId.mockResolvedValue({
      userId: "user-1",
      defaultVehicleId: "v1",
      defaultRouteType: "rapida",
    });

    const state = await service.restoreApplicationState(
      "usuario@test.com"
    );

    expect(state.user.email).toBe("usuario@test.com");
    expect(state.vehicles).toHaveLength(1);
    expect(state.places).toHaveLength(1);
    expect(state.savedRoutes).toHaveLength(1);
    expect(state.preferences.defaultRouteType).toBe("rapida");
  });

  // ==================================================
  // HU23_E02 – Fallo de persistencia
  // ==================================================
  test("HU23_E02 – Error si no hay acceso a persistencia", async () => {
    userRepositoryMock.findByEmail.mockRejectedValue(
      new Error("DB down")
    );

    await expect(
      service.restoreApplicationState("usuario@test.com")
    ).rejects.toThrow(PersistenceAccessError);
  });
});

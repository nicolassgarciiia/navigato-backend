import { RouteService } from "../../../src/modules/route/application/route.service";
import { UserRepository } from  "../../../src/modules/user/domain/user.repository";
import { POIRepository } from "../../../src/modules/poi/domain/poi.repository";
import { VehicleRepository } from "../../../src/modules/vehicle/domain/vehicle.repository";
import { RouteRepository } from "../../../src/modules/route/domain/route.repository";
import { SavedRoute } from "../../../src/modules/route/domain/saved-route.entity";

import {
  AuthenticationRequiredError,
  SavedRouteNotFoundError,
} from "../../../src/modules/route/domain/errors";
import { Route } from "src/modules/route/domain/route.entity";


describe("HU20 – Marcar ruta como favorita", () => {
  let service: RouteService;

  let userRepository: jest.Mocked<UserRepository>;
  let poiRepository: jest.Mocked<POIRepository>;
  let vehicleRepository: jest.Mocked<VehicleRepository>;
  let routeRepository: jest.Mocked<RouteRepository>;
  let routingAdapter: any;

  const EMAIL = "test@test.com";
  const USER_ID = "user-123";

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
    } as any;

    poiRepository = {
      findByUser: jest.fn(),
    } as any;

    vehicleRepository = {
      findByUser: jest.fn(),
    } as any;

    routeRepository = {
      save: jest.fn(),
      findByUser: jest.fn(),
      findByName: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as any;

    routingAdapter = {
      calculate: jest.fn(),
    };

    service = new RouteService(
      userRepository,
      poiRepository,
      vehicleRepository,
      routeRepository,
      routingAdapter
    );
  });

  // ==================================================
  // HU20_E01 – Marcar ruta como favorita
  // ==================================================
  test("HU20_E01 – Debe marcar una ruta guardada como favorita", async () => {
    // GIVEN: usuario autenticado
    userRepository.findByEmail.mockResolvedValue({ id: USER_ID } as any);

    // 🔑 MOCK DE ROUTE SIN CONSTRUCTOR (CLAVE)
    const fakeRoute: Route = {
      id: "route-123",
      origen: { nombre: "Origen" },
      destino: { nombre: "Destino" },
      distancia: 10,
      duracion: 5,
      metodoMovilidad: "car",
      tipo: "rapida",
      trayecto: [],
      coordenadas: [],
      coste: 0,
    };

    const savedRoute = new SavedRoute({
      nombre: "Ruta Favorita",
      favorito: false,
      route: fakeRoute,
      fechaGuardado: new Date(),
    });

    routeRepository.findByName.mockResolvedValue(savedRoute);

    // WHEN
    await service.toggleRouteFavorite(EMAIL, "Ruta Favorita");

    // THEN
    expect(savedRoute.favorito).toBe(true);
    expect(routeRepository.update).toHaveBeenCalledWith(USER_ID, savedRoute);
  });

  // ==================================================
  // HU20_E03 – Usuario no autenticado
  // ==================================================
  test("HU20_E03 – Error si el usuario no está autenticado", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.toggleRouteFavorite(EMAIL, "Ruta X")
    ).rejects.toBeInstanceOf(AuthenticationRequiredError);
  });

  // ==================================================
  // HU20_E02 – Ruta no existe
  // ==================================================
  test("HU20_E02 – Error si la ruta no existe", async () => {
    userRepository.findByEmail.mockResolvedValue({ id: USER_ID } as any);
    routeRepository.findByName.mockResolvedValue(null);

    await expect(
      service.toggleRouteFavorite(EMAIL, "Ruta Inexistente")
    ).rejects.toBeInstanceOf(SavedRouteNotFoundError);
  });

  // ==================================================
  // HU20_E05 – Desmarcar ruta favorita
  // ==================================================
  test("HU20_E05 – Debe desmarcar una ruta que ya era favorita", async () => {
    userRepository.findByEmail.mockResolvedValue({ id: USER_ID } as any);

    const fakeRoute: Route = {
      id: "route-456",
      origen: { nombre: "Origen" },
      destino: { nombre: "Destino" },
      distancia: 12,
      duracion: 6,
      metodoMovilidad: "car",
      tipo: "rapida",
      trayecto: [],
      coordenadas: [],
      coste: 0,
    };

    const savedRoute = new SavedRoute({
      nombre: "Ruta Favorita",
      favorito: true,
      route: fakeRoute,
      fechaGuardado: new Date(),
    });

    routeRepository.findByName.mockResolvedValue(savedRoute);

    await service.toggleRouteFavorite(EMAIL, "Ruta Favorita");

    expect(savedRoute.favorito).toBe(false);
    expect(routeRepository.update).toHaveBeenCalledWith(USER_ID, savedRoute);
  });
});



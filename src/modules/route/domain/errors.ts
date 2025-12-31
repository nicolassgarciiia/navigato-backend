// ===============================
// Errores de dominio – Rutas
// ===============================

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("AuthenticationRequiredError");
    this.name = "AuthenticationRequiredError";
  }
}

export class RouteNotCalculatedError extends Error {
  constructor() {
    super("RouteNotCalculatedError");
    this.name = "RouteNotCalculatedError";
  }
}

export class InvalidPlaceOfInterestError extends Error {
  constructor() {
    super("InvalidPlaceOfInterestError");
    this.name = "InvalidPlaceOfInterestError";
  }
}

export class VehicleNotFoundError extends Error {
  constructor() {
    super("VehicleNotFoundError");
    this.name = "VehicleNotFoundError";
  }
}

export class NameAlreadyExistsError extends Error {
  constructor() {
    super("NameAlreadyExistsError");
    this.name = "NameAlreadyExistsError";
  }
}

export class SavedRouteNotFoundError extends Error {
  constructor() {
    super("SavedRouteNotFoundError");
    this.name = "SavedRouteNotFoundError";
  }
}

export class InvalidRouteTypeError extends Error {
  constructor() {
    super("InvalidRouteTypeError");
    this.name = "InvalidRouteTypeError";
  }
}

export class RoutingServiceUnavailableError extends Error {
  constructor() {
    super("RoutingServiceUnavailableError");
    this.name = "RoutingServiceUnavailableError";
  }
}

export class FuelServiceUnavailableError extends Error {
  constructor() {
    super("FuelServiceUnavailableError");
    this.name = "FuelServiceUnavailableError";
  }
}

export class CalorieServiceUnavailableError extends Error {
  constructor() {
    super("CalorieServiceUnavailableError");
    this.name = "CalorieServiceUnavailableError";
  }
}

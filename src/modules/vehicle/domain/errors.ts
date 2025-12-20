export class InvalidVehicleConsumptionError extends Error {
  constructor() {
    super("InvalidVehicleConsumptionError");
    this.name = "InvalidVehicleConsumptionError";
  }
}

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("AuthenticationRequiredError");
    this.name = "AuthenticationRequiredError";
  }
}

export class DatabaseConnectionError extends Error {
  constructor() {
    super("DatabaseConnectionError");
    this.name = "DatabaseConnectionError";
  }
}

export class VehicleNotFoundError extends Error {
  constructor() {
    super("VehicleNotFoundError");
    this.name = "VehicleNotFoundError";
  }
}


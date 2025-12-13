export class InvalidCoordinatesFormatError extends Error {
  constructor() {
    super("InvalidCoordinatesFormatError");
  }
}

export class InvalidPOINameError extends Error {
  constructor() {
    super("InvalidPOINameError");
  }
}

export class DuplicatePOINameError extends Error {
  constructor() {
    super("DuplicatePOINameError");
  }
}

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("AuthenticationRequiredError");
  }
}

export class GeocodingServiceUnavailableError extends Error {
  constructor() {
    super("GeocodingServiceUnavailableError");
  }
}

export class DatabaseConnectionError extends Error {
  constructor() {
    super("DatabaseConnectionError");
  }
}

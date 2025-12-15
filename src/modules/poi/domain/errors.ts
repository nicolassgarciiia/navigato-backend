export class InvalidCoordinatesFormatError extends Error {
  constructor() {
    super("InvalidCoordinatesFormatError");
    this.name = "InvalidCoordinatesFormatError";
  }
}

export class InvalidPOINameError extends Error {
  constructor() {
    super("InvalidPOINameError");
    this.name = "InvalidPOINameError";
  }
}

export class DuplicatePOINameError extends Error {
  constructor() {
    super("DuplicatePOINameError");
    this.name = "DuplicatePOINameError";
  }
}

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("AuthenticationRequiredError");
    this.name = "AuthenticationRequiredError";
  }
}

export class GeocodingServiceUnavailableError extends Error {
  constructor() {
    super("GeocodingServiceUnavailableError");
    this.name = "GeocodingServiceUnavailableError";
  }
}

export class DatabaseConnectionError extends Error {
  constructor() {
    super("DatabaseConnectionError");
    this.name = "DatabaseConnectionError";
  }
}
export class GeocodingToponymNotFoundError extends Error {
  constructor() {
    super("GeocodingToponymNotFoundError");
    this.name = "GeocodingToponymNotFoundError";
  }
}


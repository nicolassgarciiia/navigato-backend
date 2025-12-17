export class GeocodingServiceUnavailableError extends Error {
  constructor() {
    super("Geocoding service unavailable");
  }
}

export class GeocodingToponymNotFoundError extends Error {
  constructor() {
    super("Toponym not found");
  }
}

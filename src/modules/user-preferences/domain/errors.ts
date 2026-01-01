// ======================================================
// Errores de dominio – User Preferences
// ======================================================

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("AuthenticationRequiredError");
    this.name = "AuthenticationRequiredError";
  }
}

export class ElementNotFoundError extends Error {
  constructor() {
    super("ElementNotFoundError");
    this.name = "ElementNotFoundError";
  }
}

export class DatabaseConnectionError extends Error {
  constructor() {
    super("DatabaseConnectionError");
    this.name = "DatabaseConnectionError";
  }
}

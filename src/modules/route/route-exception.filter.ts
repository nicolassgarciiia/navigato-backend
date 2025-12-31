import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";

@Catch(Error)
export class RouteExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    switch (exception.name) {
      case "AuthenticationRequiredError":
        return response.status(HttpStatus.UNAUTHORIZED).json({ error: exception.name });

      case "RouteNotCalculatedError":
        return response.status(HttpStatus.BAD_REQUEST).json({ error: exception.name });

      case "NameAlreadyExistsError":
        return response.status(HttpStatus.CONFLICT).json({ error: exception.name });

      case "SavedRouteNotFoundError":
        return response.status(HttpStatus.NOT_FOUND).json({ error: exception.name });

      case "InvalidRouteTypeError":
        return response.status(HttpStatus.BAD_REQUEST).json({ error: exception.name });

      default:
        return response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: "InternalServerError" });
    }
  }
}

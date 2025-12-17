import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  ServiceUnavailableException,
  NotFoundException,
} from "@nestjs/common";
import {
  InvalidPOINameError,
  DuplicatePOINameError,
  InvalidCoordinatesFormatError,
  AuthenticationRequiredError,
  GeocodingServiceUnavailableError,
  DatabaseConnectionError,
  PlaceOfInterestNotFoundError,
} from "./domain/errors";

@Catch(
  InvalidPOINameError,
  DuplicatePOINameError,
  InvalidCoordinatesFormatError,
  AuthenticationRequiredError,
  GeocodingServiceUnavailableError,
  DatabaseConnectionError,
  PlaceOfInterestNotFoundError
)
export class POIExceptionFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    if (
      error instanceof InvalidPOINameError ||
      error instanceof DuplicatePOINameError ||
      error instanceof InvalidCoordinatesFormatError
    ) {
      throw new BadRequestException(error.message);
    }

    if (error instanceof AuthenticationRequiredError) {
      throw new UnauthorizedException(error.message);
    }

    if (error instanceof PlaceOfInterestNotFoundError) {
      throw new NotFoundException(error.message);
    }

    if (error instanceof GeocodingServiceUnavailableError) {
      throw new ServiceUnavailableException(error.message);
    }

    if (error instanceof DatabaseConnectionError) {
      throw new InternalServerErrorException(error.message);
    }

    throw error;
  }
}
